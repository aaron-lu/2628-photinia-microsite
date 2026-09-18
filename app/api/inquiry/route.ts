import { checkBotId } from "botid/server";
import { after } from "next/server";
import { handleInquiryRequest, type CapturedInquiry } from "@/lib/inquiry-delivery";
import { inquiryCaptureEnabled } from "@/lib/inquiry-config";
import { receiptIdFor, storeInquiry, writePrivateJson } from "@/lib/inquiry-storage";
import { sendInquiryNotification } from "@/lib/inquiry-notifications";
import listingJson from "@/content/listing.json";
import { generatedListingSchema } from "@/lib/site-content";

export const runtime = "nodejs";
export const maxDuration = 60;
const listing = generatedListingSchema.parse(listingJson);

async function notifyListingTeam(inquiry: CapturedInquiry) {
  const result = await sendInquiryNotification(inquiry, listing.identity.street);
  // Separate from the immutable lead; absence of this record also needs review.
  await writePrivateJson(`notifications/${inquiry.propertyId}/${inquiry.receiptId}.json`, {
    receiptId: inquiry.receiptId, recordedAt: new Date().toISOString(), ...result,
  });
  if (result.status !== "sent") console.error("inquiry_notification_needs_attention", { receiptId: inquiry.receiptId, ...result });
}

export async function POST(request: Request) {
  if (!inquiryCaptureEnabled()) return Response.json({ error: "Inquiry delivery is not configured" }, { status: 503 });
  const verification = await checkBotId({ advancedOptions: { checkLevel: "basic" } });
  if (verification.isBot) return Response.json({ error: "Unable to verify this submission" }, { status: 403 });
  return handleInquiryRequest(request, {
    propertyId: listing.id,
    createReceiptId: (id) => receiptIdFor(listing.id, id, process.env.INQUIRY_RECEIPT_SECRET!),
    store: storeInquiry,
    notify: notifyListingTeam,
    defer: (task) => after(task),
  });
}
