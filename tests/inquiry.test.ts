import assert from "node:assert/strict";
import test from "node:test";
import { POST } from "../app/api/inquiry/route";
import { handleInquiryRequest, type CapturedInquiry } from "../lib/inquiry-delivery";

const validInquiry = {
  propertyId: "2628-photinia",
  name: "QA Test",
  email: "qa@example.com",
  phone: "",
  message: "This is an authorized delivery test.",
  consent: true,
  submissionId: "b0c7c99c-7718-4e0a-9daf-0c04567cb408",
};

function request(body: unknown, origin = "http://localhost") {
  return new Request("http://localhost/api/inquiry", {
    method: "POST",
    headers: { "content-type": "application/json", origin, "x-requested-with": "fetch" },
    body: JSON.stringify(body),
  });
}

function delivery(store: (inquiry: CapturedInquiry) => Promise<void>) {
  return {
    propertyId: validInquiry.propertyId,
    createReceiptId: (submissionId: string) => `receipt-${submissionId}`,
    store,
  };
}

test("rejects invalid inquiries", async () => {
  const response = await handleInquiryRequest(request({ name: "A" }), delivery(async () => undefined));
  assert.equal(response.status, 400);
});

test("rejects cross-origin submissions", async () => {
  const response = await handleInquiryRequest(request(validInquiry, "https://example.com"), delivery(async () => undefined));
  assert.equal(response.status, 403);
});

test("fails visibly when durable delivery is not configured", async () => {
  const previous = process.env.BLOB_READ_WRITE_TOKEN;
  delete process.env.BLOB_READ_WRITE_TOKEN;
  try {
    const response = await POST(request(validInquiry));
    assert.equal(response.status, 503);
  } finally {
    if (previous) process.env.BLOB_READ_WRITE_TOKEN = previous;
    else delete process.env.BLOB_READ_WRITE_TOKEN;
  }
});

test("stores a validated inquiry before sending its notification", async () => {
  const events: string[] = [];
  let captured: CapturedInquiry | undefined;
  const response = await handleInquiryRequest(request(validInquiry), {
    ...delivery(async (inquiry) => {
      captured = inquiry;
      events.push("stored");
    }),
    notify: async () => {
      events.push("notified");
    },
  });
  const payload: unknown = await response.json();

  assert.equal(response.status, 201);
  assert.deepEqual(events, ["stored", "notified"]);
  assert.equal(captured?.propertyId, "2628-photinia");
  assert.equal(captured?.receiptId, `receipt-${validInquiry.submissionId}`);
  assert.equal(typeof payload === "object" && payload !== null && "receiptId" in payload, true);
});

test("does not lose a captured inquiry when notification fails", async () => {
  let stored = false;
  const originalError = console.error;
  console.error = () => undefined;
  try {
    const response = await handleInquiryRequest(request(validInquiry), {
      ...delivery(async () => { stored = true; }),
      notify: async () => { throw new Error("mail unavailable"); },
    });
    assert.equal(response.status, 201);
    assert.equal(stored, true);
  } finally {
    console.error = originalError;
  }
});

test("silently discards honeypot submissions", async () => {
  let stored = false;
  const response = await handleInquiryRequest(request({ ...validInquiry, website: "spam.example" }), {
    ...delivery(async () => { stored = true; }),
  });
  assert.equal(response.status, 201);
  assert.equal(stored, false);
});

test("rejects a property identifier that is not the server-configured listing", async () => {
  let stored = false;
  const response = await handleInquiryRequest(request({ ...validInquiry, propertyId: "another-listing" }), {
    ...delivery(async () => { stored = true; }),
  });
  assert.equal(response.status, 400);
  assert.equal(stored, false);
});
