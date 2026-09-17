import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the property microsite", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>2628 Photinia Court \| Pleasanton Home<\/title>/i);
  assert.match(html, /2628 Photinia Court/);
  assert.match(html, /\$1,698,000/);
  assert.match(html, /Bay East MLS #41147570/);
  assert.match(html, /Approved listing photography/);
  assert.match(html, /Amaral Park/);
  assert.match(html, /shug\.sidhu@compass\.com/);
  assert.match(html, /andre\.wang@compass\.com/);
  assert.match(html, /Preview form only/);
  assert.doesNotMatch(html, /11 Rudgear|Walnut Creek|41141833|\$1,595,000/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/);
});

test("keeps the listing data reusable and remote-image compatible", async () => {
  const [page, data, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/property-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(data, /export type PropertySiteData/);
  assert.match(data, /fully-qualified remote URL/);
  assert.match(data, /\/property\/living-room-hero\.jpg/);
  assert.match(data, /https:\/\/cdn\.example\.org/);
  assert.match(page, /property\.gallery/);
  assert.match(page, /property\.neighborhood/);
  assert.match(page, /activeResourceModules/);
  assert.match(page, /property\.contact\.sentStatus/);
  assert.match(layout, /2628 Photinia Court \| Pleasanton Home/);
  assert.doesNotMatch(data, /11 Rudgear|41141833|\$1,595,000/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
