// Read-only operator check. Run in an authorized server environment, never the browser.
// Lists receipt IDs and notification outcomes only; does not download buyer records.
import { get, list } from "@vercel/blob";
import { readFile } from "node:fs/promises";
const { id } = JSON.parse(await readFile(new URL("../content/listing.json", import.meta.url), "utf8"));
let cursor;
let total = 0;
let attention = 0;
do {
  const page = await list({ prefix: `leads/${id}/`, cursor });
  for (const blob of page.blobs) {
    const receiptId = blob.pathname.split("/").at(-1)?.replace(/\.json$/, "");
    if (!receiptId || !/^[a-f0-9]{24,32}$/.test(receiptId)) continue;
    total++;
    const result = await get(`notifications/${id}/${receiptId}.json`, { access: "private", useCache: false });
    const outcome = result?.statusCode === 200 ? await new Response(result.stream).json() : null;
    if (outcome?.status !== "sent") {
      attention++;
      console.log(JSON.stringify({ receiptId, status: outcome?.status ?? "unresolved", reason: outcome?.reason ?? "no_notification_outcome" }));
    }
  }
  cursor = page.hasMore ? page.cursor : undefined;
} while (cursor);
console.log(JSON.stringify({ total, needsAttention: attention }));
process.exitCode = attention ? 2 : 0;
