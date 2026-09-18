type Environment = Readonly<Record<string, string | undefined>>;

/** Configuration only: actual private-store access is verified by the write. */
export function inquiryCaptureEnabled(env: Environment = process.env) {
  if (env.VERCEL_ENV === "preview" && env.INQUIRY_PREVIEW_ENABLED !== "true") return false;
  const hasStorage = Boolean(env.BLOB_STORE_ID?.trim() || env.BLOB_READ_WRITE_TOKEN?.trim());
  return hasStorage && (env.INQUIRY_RECEIPT_SECRET?.trim().length ?? 0) >= 32;
}
