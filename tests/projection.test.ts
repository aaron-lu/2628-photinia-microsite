import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { generatedListingSchema, projectListing } from "../lib/site-content";

async function listing() {
  const raw: unknown = JSON.parse(await readFile(new URL("../content/listing.json", import.meta.url), "utf8"));
  return generatedListingSchema.parse(raw);
}

test("MLS projection has no brand, agents, or inquiry capability", async () => {
  const source = await listing();
  const mls = projectListing(source, "mls");
  const serialized = JSON.stringify(mls).toLowerCase();

  assert.equal(mls.kind, "mls");
  assert.equal("brand" in mls, false);
  assert.equal("inquiry" in mls, false);
  assert.equal(serialized.includes("recentListings".toLowerCase()), false);
  assert.equal(serialized.includes(source.brand.brokerageName.toLowerCase()), false);
  for (const agent of source.brand.agents) {
    assert.equal(serialized.includes(agent.email.toLowerCase()), false);
    assert.equal(serialized.includes(agent.phone.toLowerCase()), false);
  }
});

test("branded projection retains approved contact content", async () => {
  const source = await listing();
  const branded = projectListing(source, "branded");

  assert.equal(branded.kind, "branded");
  assert.equal(branded.brand.agents.length > 0, true);
  assert.equal(branded.brand.recentListings.length > 0, true);
  assert.equal(branded.inquiry.heading.length > 0, true);
});

test("both projections use the same approved property facts", async () => {
  const source = await listing();
  const branded = projectListing(source, "branded");
  const mls = projectListing(source, "mls");

  assert.deepEqual(branded.property.identity, mls.property.identity);
  assert.deepEqual(branded.property.facts, mls.property.facts);
  assert.equal(branded.property.hero.src, mls.property.hero.src);
});
