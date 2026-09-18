import assert from "node:assert/strict";
import test from "node:test";
import { inquiryCaptureEnabled } from "../lib/inquiry-config";

const secret = "test-only-receipt-secret-32-characters-minimum";
test("OIDC store and a dedicated receipt secret enable production capture", () => {
  assert.equal(inquiryCaptureEnabled({ BLOB_STORE_ID: "store_test", INQUIRY_RECEIPT_SECRET: secret, VERCEL_ENV: "production" }), true);
});
test("legacy token still needs an independent signing secret", () => {
  assert.equal(inquiryCaptureEnabled({ BLOB_READ_WRITE_TOKEN: "token" }), false);
  assert.equal(inquiryCaptureEnabled({ BLOB_READ_WRITE_TOKEN: "token", INQUIRY_RECEIPT_SECRET: secret }), true);
});
test("store without secret, short secrets, and missing storage stay disabled", () => {
  for (const env of [{ BLOB_STORE_ID: "store_test" }, { BLOB_STORE_ID: "store_test", INQUIRY_RECEIPT_SECRET: "short" }, { INQUIRY_RECEIPT_SECRET: secret }]) assert.equal(inquiryCaptureEnabled(env), false);
});
test("preview capture is explicitly opt-in", () => {
  const env = { BLOB_STORE_ID: "store_test", INQUIRY_RECEIPT_SECRET: secret, VERCEL_ENV: "preview" };
  assert.equal(inquiryCaptureEnabled(env), false);
  assert.equal(inquiryCaptureEnabled({ ...env, INQUIRY_PREVIEW_ENABLED: "true" }), true);
});
