import { get, put } from "@vercel/blob";
import { createHmac } from "node:crypto";
import { InquiryConflictError, inquirySchema, type CapturedInquiry } from "./inquiry-delivery";
import { z } from "zod";

const storedSchema = inquirySchema.omit({ website: true, submissionId: true }).extend({ receiptId: z.string(), capturedAt: z.iso.datetime() });

export function receiptIdFor(propertyId: string, submissionId: string, secret: string) {
  if (secret.trim().length < 32) throw new Error("Receipt signing secret is not configured");
  return createHmac("sha256", secret).update(`${propertyId}:${submissionId}`).digest("hex").slice(0, 32);
}

// No date in the key: retries across midnight must address the same record.
export function inquiryPath(inquiry: Pick<CapturedInquiry, "propertyId" | "receiptId">) {
  return `leads/${inquiry.propertyId}/${inquiry.receiptId}.json`;
}

export function sameInquiry(a: CapturedInquiry, b: CapturedInquiry) {
  return a.receiptId === b.receiptId && a.propertyId === b.propertyId &&
    a.name === b.name && a.email === b.email && (a.phone ?? "") === (b.phone ?? "") &&
    a.message === b.message && a.consent === b.consent;
}

export async function readPrivateJson(path: string): Promise<unknown | null> {
  const result = await get(path, { access: "private", useCache: false });
  if (!result) return null;
  if (result.statusCode !== 200) throw new Error("Unexpected private storage response");
  return new Response(result.stream).json();
}

export async function writePrivateJson(path: string, value: unknown) {
  return put(path, `${JSON.stringify(value, null, 2)}\n`, {
    access: "private", addRandomSuffix: false, allowOverwrite: false, contentType: "application/json",
  });
}

/** Atomic create; a duplicate never overwrites the original lead or timestamp. */
export async function storeInquiry(inquiry: CapturedInquiry, storage = { write: writePrivateJson, read: readPrivateJson }) {
  const path = inquiryPath(inquiry);
  try {
    await storage.write(path, inquiry);
    return { created: true };
  } catch (writeError) {
    // Also resolves an ambiguous write timeout without assuming the lead was lost.
    const existing = await storage.read(path);
    if (!existing) throw writeError;
    if (!sameInquiry(storedSchema.parse(existing), inquiry)) throw new InquiryConflictError();
    return { created: false };
  }
}
