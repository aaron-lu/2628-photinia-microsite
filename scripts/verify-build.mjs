import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const location = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await htmlFiles(location));
    if (entry.isFile() && entry.name.endsWith(".html")) files.push(location);
  }
  return files;
}

const files = await htmlFiles(path.resolve(".next/server/app"));
const pages = await Promise.all(files.map(async (file) => ({ file, html: await readFile(file, "utf8") })));
const branded = pages.find((page) => page.html.includes('data-audience="branded"'));
const mls = pages.find((page) => page.html.includes('data-audience="mls"'));

assert.ok(branded, "Built branded HTML was not found");
assert.ok(mls, "Built MLS HTML was not found");
assert.equal(mls.html.includes("inquiry-form"), false, "MLS HTML contains the inquiry form");
assert.equal(mls.html.includes("agent-panel"), false, "MLS HTML contains the agent panel");
assert.equal(mls.html.includes('href="tel:'), false, "MLS HTML contains a phone link");
assert.equal(mls.html.includes('href="mailto:'), false, "MLS HTML contains an email link");
assert.equal(mls.html.includes('type="application/ld+json"'), false, "MLS HTML contains branded structured data");
assert.match(branded.html, /type="application\/ld\+json"/, "Branded HTML is missing structured data");
assert.match(branded.html, /rel="canonical"/, "Branded HTML is missing its canonical link");
for (const phrase of [
  "Approved listing photography",
  "Verified listing feature",
  "Draft for review",
  "Source-checked",
  "Delivery must be configured",
]) {
  assert.equal(branded.html.includes(phrase), false, `Branded HTML contains internal copy: ${phrase}`);
  assert.equal(mls.html.includes(phrase), false, `MLS HTML contains internal copy: ${phrase}`);
}

process.stdout.write(`Verified branded and MLS artifacts in ${files.length} rendered HTML files.\n`);
