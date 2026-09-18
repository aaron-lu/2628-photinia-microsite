import { z } from "zod";
import type { CapturedInquiry } from "./inquiry-delivery";

export type NotificationResult = { status: "sent" | "failed" | "not_configured"; attempts: number; reason?: string };
type Options = {
  env?: Readonly<Record<string, string | undefined>>;
  fetcher?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
};

/** Bounded retries share one provider idempotency key; no buyer data in errors. */
export async function sendInquiryNotification(inquiry: CapturedInquiry, address: string, options: Options = {}): Promise<NotificationResult> {
  const env = options.env ?? process.env;
  const apiKey = env.RESEND_API_KEY;
  const recipients = z.array(z.email()).min(1).safeParse(env.LEAD_NOTIFICATION_TO?.split(",").map((value) => value.trim()).filter(Boolean));
  const sender = env.LEAD_NOTIFICATION_FROM?.trim();
  if (!apiKey || !recipients.success || !sender) return { status: "not_configured", attempts: 0, reason: "email_configuration_incomplete" };
  const fetcher = options.fetcher ?? fetch;
  const sleep = options.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  const body = JSON.stringify({
    from: sender, to: recipients.data, reply_to: inquiry.email,
    subject: env.LEAD_NOTIFICATION_SUBJECT ?? `New inquiry for ${address}`,
    text: [`Name: ${inquiry.name}`, `Email: ${inquiry.email}`, `Phone: ${inquiry.phone || "Not provided"}`, "", inquiry.message, "", `Receipt: ${inquiry.receiptId}`, `Captured: ${inquiry.capturedAt}`].join("\n"),
  });
  let reason = "network_error";
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetcher("https://api.resend.com/emails", {
        method: "POST",
        headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json", "idempotency-key": `inquiry-${inquiry.receiptId}` },
        body, signal: AbortSignal.timeout(8_000),
      });
      if (response.ok) return { status: "sent", attempts: attempt };
      reason = `email_http_${response.status}`;
      if (response.status !== 429 && response.status < 500) return { status: "failed", attempts: attempt, reason };
    } catch { reason = "email_network_or_timeout"; }
    if (attempt < 3) await sleep(attempt * 1000);
  }
  return { status: "failed", attempts: 3, reason };
}
