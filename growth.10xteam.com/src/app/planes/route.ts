import { readFile } from "node:fs/promises";
import path from "node:path";
import catalog from "./catalog.json";

export const dynamic = "force-static";

export async function GET() {
  const rawHtml = await readFile(path.join(process.cwd(), "planes-preview.html"), "utf8");
  const safeCatalog = JSON.stringify(catalog).replace(/</g, "\\u003c");
  const html = rawHtml.replace("<!--__PLANES_CATALOG__-->", '<script id="planes-data" type="application/json">' + safeCatalog + "</script>");
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}
