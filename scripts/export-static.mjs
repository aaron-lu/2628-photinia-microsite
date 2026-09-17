import { cp, mkdir, rm, writeFile } from "node:fs/promises";

const projectRoot = new URL("../", import.meta.url);
const clientDirectory = new URL("dist/client/", projectRoot);
const outputDirectory = new URL("static-build/", projectRoot);
const workerUrl = new URL("dist/server/index.js", projectRoot);

workerUrl.searchParams.set("static-export", String(Date.now()));

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });
await cp(clientDirectory, outputDirectory, { recursive: true });

const { default: worker } = await import(workerUrl.href);
const response = await worker.fetch(
  new Request("https://listing-preview.example/", {
    headers: { accept: "text/html" },
  }),
  {
    ASSETS: {
      fetch: async () => new Response("Not found", { status: 404 }),
    },
  },
  {
    waitUntil() {},
    passThroughOnException() {},
  },
);

if (!response.ok) {
  throw new Error(`Static export failed with ${response.status}`);
}

const html = await response.text();
await writeFile(new URL("index.html", clientDirectory), html);
await writeFile(new URL("index.html", outputDirectory), html);
console.log("Static Vercel output written to static-build/");
