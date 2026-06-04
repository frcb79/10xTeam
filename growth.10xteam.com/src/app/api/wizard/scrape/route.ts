import { NextResponse } from "next/server";

interface ScrapeRequestBody {
  websiteUrl?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ScrapeRequestBody;
    const websiteUrl = body.websiteUrl?.trim();

    if (!websiteUrl) {
      return NextResponse.json(
        { error: "websiteUrl is required." },
        { status: 400 }
      );
    }

    const normalized = normalizeUrl(websiteUrl);
    if (!normalized) {
      return NextResponse.json(
        { error: "Invalid websiteUrl." },
        { status: 400 }
      );
    }

    const response = await fetch(normalized, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; 10xteam-bot/1.0; +https://growth.10xteam.com)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Could not scrape website. HTTP ${response.status}.`,
        },
        { status: 502 }
      );
    }

    const html = await response.text();
    const title = matchTagContent(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
    const description = matchTagContent(
      html,
      /<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i
    );

    const textContent = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;|&#160;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 14_000);

    return NextResponse.json({
      websiteUrl: normalized,
      title,
      description,
      scrapedContent: [title, description, textContent].filter(Boolean).join("\n\n"),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not scrape website.",
      },
      { status: 500 }
    );
  }
}

function normalizeUrl(input: string): string | null {
  try {
    const withProtocol = /^https?:\/\//i.test(input) ? input : `https://${input}`;
    const url = new URL(withProtocol);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function matchTagContent(source: string, pattern: RegExp): string {
  const match = source.match(pattern);
  if (!match?.[1]) return "";
  return match[1].replace(/\s+/g, " ").trim().slice(0, 400);
}
