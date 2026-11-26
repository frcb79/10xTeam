import { readFile } from "node:fs/promises";
import path from "node:path";
import { localizeGrowthHtml } from "../growth-site/localize";
import { EARLY_ACCESS_STYLES, EARLY_ACCESS_MODAL } from "../growth-site/early-access";
export async function GET(request: Request) {
  const lang = new URL(request.url).searchParams.get("lang") === "en" ? "en" : "es";
  const title = lang === "en" ? "Plans, features and solutions for your business" : "Planes, funcionalidades y soluciones para tu negocio";
  const source = await readFile(path.join(process.cwd(), "10x_pricing.html"), "utf8");
  const html = localizeGrowthHtml(source.replace("</head>", EARLY_ACCESS_STYLES + "\n</head>").replace("</body>", EARLY_ACCESS_MODAL + "\n</body>"), lang)
    .replace(/<title>[^<]*<\/title>/, "<title>10xteam Growth | " + title + "</title>")
    .replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="' + title + '">')
    .replaceAll('href="https://growth.10xteam.com.mx/?lang=', 'href="https://growth.10xteam.com.mx/pricing-canon?lang=')
    .replaceAll('href="/"', 'href="/?lang=' + lang + '"');
  return new Response(html, {headers: {"content-type":"text/html; charset=utf-8", "cache-control":"no-store"}});
}
