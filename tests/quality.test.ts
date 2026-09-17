import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { generatedListingSchema, projectListing } from "../lib/site-content";

test("uses only system font stacks", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.equal(css.includes("@font-face"), false);
  assert.equal(/url\([^)]*\.(woff2?|ttf|otf)/i.test(css), false);
  assert.equal(/compass[^;{]*font/i.test(css), false);
});

test("publication disclosures cover the approved categories on both routes", async () => {
  const raw: unknown = JSON.parse(await readFile(new URL("../content/listing.json", import.meta.url), "utf8"));
  const listing = generatedListingSchema.parse(raw);

  for (const route of [projectListing(listing, "branded"), projectListing(listing, "mls")]) {
    assert.match(route.disclosure, /Floor Plans:/);
    assert.match(route.disclosure, /Schools:/);
    assert.match(route.disclosure, /Information Accuracy:/);
  }
});
