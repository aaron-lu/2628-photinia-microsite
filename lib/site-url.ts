import { z } from "zod";
import listing from "@/content/listing.json";

const siteUrlSchema = z.url().transform((value) => new URL(value).origin);

export const SITE_URL = siteUrlSchema.parse(
  process.env.NEXT_PUBLIC_SITE_URL || listing.seo.siteUrl,
);
