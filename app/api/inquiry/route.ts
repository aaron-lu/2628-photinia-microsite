import { put } from "@vercel/blob";
import { checkBotId } from "botid/server";
import { createHmac } from "node:crypto";
import { after } from "next/server";
import { z } from "zod";
import { handleInquiryRequest, type CapturedInquiry } from "@/lib/inquiry-delivery";
import listingJson from "@/content/listing.json";
import { generatedListingSchema } from "@/lib/site-content";

export const runtime = "nodejs";

const recipientSchema = z.array(z.email()).min(1);
const listing = generatedListingSchema.parse(listingJson);

function createReceiptId(submissionId: string) {
  const secret = process.env.BLOB_READ_WRITE_TOKEN;
  if (!secret) throw new Error("Inquiry delivery is not configured");
  return createHmac("sha256", secret).update(`${listing.id}:${submissionId}`).digest("hex").slice(0, 24);
}

function leadPath(inquiry: CapturedInquiry) {
  const day = inquiry.capturedAt.slice(0, 10);
  return `leads/${inquiry.propertyId}/${day}/${inquiry.receiptId}.json`;
}

async function storeInquiry(inquiry: CapturedInquiry) {
  await put(leadPath(inquiry), `${JSON.stringify(inquiry, null, 2)}\n`, {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

async function notifyListingTeam(inquiry: CapturedInquiry) {
  const apiKey = process.env.RESEND_API_KEY;
  const rawRecipients = process.env.LEAD_NOTIFICATION_TO;
  const sender = process.env.LEAD_NOTIFICATION_FROM;
  if (!apiKey && !rawRecipients && !sender) return;
  if (!apiKey || !rawRecipients || !sender) {
    throw new Error("Resend requires RESEND_API_KEY, LEAD_NOTIFICATION_TO, and LEAD_NOTIFICATION_FROM");
  }

  const recipients = recipientSchema.parse(rawRecipients.split(",").map((value) => value.trim()).filter(Boolean));
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
      "idempotency-key": inquiry.receiptId,
    },
    body: JSON.stringify({
      from: sender,
      to: recipients,
      reply_to: inquiry.email,
      subject: process.env.LEAD_NOTIFICATION_SUBJECT ?? `New inquiry for ${listing.identity.street}`,
      text: [
        `Name: ${inquiry.name}`,
        `Email: ${inquiry.email}`,
        `Phone: ${inquiry.phone || "Not provided"}`,
        "",
        inquiry.message,
        "",
        `Receipt: ${inquiry.receiptId}`,
        `Captured: ${inquiry.capturedAt}`,
      ].join("\n"),
    }),
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new Error(`Resend notification failed with status ${response.status}`);
  }
}

export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json({ error: "Inquiry delivery is not configured" }, { status: 503 });
  }
  const verification = await checkBotId({ advancedOptions: { checkLevel: "basic" } });
  if (verification.isBot) {
    return Response.json({ error: "Unable to verify this submission" }, { status: 403 });
  }
  return handleInquiryRequest(request, {
    propertyId: listing.id,
    createReceiptId,
    store: storeInquiry,
    notify: notifyListingTeam,
    defer: (task) => after(task),
  });
}
