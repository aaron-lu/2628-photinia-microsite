import "server-only";
import listingJson from "@/content/listing.json";
import { generatedListingSchema, projectListing } from "@/lib/site-content";

const listing = generatedListingSchema.parse(listingJson);

export function getBrandedPage() {
  return projectListing(listing, "branded");
}

export function getMlsPage() {
  return projectListing(listing, "mls");
}
