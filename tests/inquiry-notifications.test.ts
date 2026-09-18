import assert from "node:assert/strict";
import test from "node:test";
import { sendInquiryNotification } from "../lib/inquiry-notifications";
import type { CapturedInquiry } from "../lib/inquiry-delivery";

const lead: CapturedInquiry = { propertyId: "2628-photinia", name: "QA Test", email: "qa@example.com", message: "Test inquiry", consent: true, receiptId: "receipt", capturedAt: "2026-09-18T00:00:00.000Z" };
const env = { RESEND_API_KEY: "fake-test-key", LEAD_NOTIFICATION_TO: "andre.wang@compass.com", LEAD_NOTIFICATION_FROM: "QA <test@example.com>" };
test("missing email configuration produces an actionable outcome without sending", async () => {
  assert.equal((await sendInquiryNotification(lead, "address", { env: {}, fetcher: async () => { throw new Error("must not send"); } })).status, "not_configured");
});
test("temporary errors retry the same message and idempotency key, only to Andre", async () => {
  const requests: RequestInit[] = [];
  const result = await sendInquiryNotification(lead, "address", { env, sleep: async () => {}, fetcher: async (_url, init) => {
    requests.push(init!);
    return new Response("{}", { status: requests.length === 3 ? 200 : 503 });
  } });
  assert.deepEqual(result, { status: "sent", attempts: 3 });
  assert.equal(new Set(requests.map((r) => new Headers(r.headers).get("idempotency-key"))).size, 1);
  assert.equal(new Set(requests.map((r) => r.body)).size, 1);
  assert.ok(requests[0]);
  assert.deepEqual(JSON.parse(requests[0].body as string).to, ["andre.wang@compass.com"]);
  assert.equal(JSON.parse(requests[0].body as string).reply_to, lead.email);
});
test("permanent errors stop immediately; network retries are bounded", async () => {
  assert.deepEqual(await sendInquiryNotification(lead, "address", { env, fetcher: async () => new Response("", { status: 401 }) }), { status: "failed", attempts: 1, reason: "email_http_401" });
  assert.deepEqual(await sendInquiryNotification(lead, "address", { env, sleep: async () => {}, fetcher: async () => { throw new Error("secret PII must not be logged"); } }), { status: "failed", attempts: 3, reason: "email_network_or_timeout" });
});
