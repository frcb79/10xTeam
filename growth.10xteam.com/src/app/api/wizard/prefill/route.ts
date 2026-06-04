import { NextResponse } from "next/server";
import { generateWithAI } from "@/lib/ai/client";

interface PrefillRequestBody {
  businessId?: string;
  websiteUrl?: string;
  scrapedContent?: string;
}

interface PrefillResponseBody {
  oneLiner: string;
  industry: string;
  mainPain: string;
  mainOutcome: string;
  differentiator: string;
  confidence: {
    oneLiner: number;
    industry: number;
    mainPain: number;
    mainOutcome: number;
    differentiator: number;
  };
}

const EMPTY_PREFILL: PrefillResponseBody = {
  oneLiner: "",
  industry: "",
  mainPain: "",
  mainOutcome: "",
  differentiator: "",
  confidence: {
    oneLiner: 0,
    industry: 0,
    mainPain: 0,
    mainOutcome: 0,
    differentiator: 0,
  },
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PrefillRequestBody;

    if (!body.websiteUrl && !body.scrapedContent) {
      return NextResponse.json(
        { error: "websiteUrl or scrapedContent is required." },
        { status: 400 }
      );
    }

    const content = body.scrapedContent ?? `Website: ${body.websiteUrl ?? "N/A"}`;

    const systemPrompt =
      "Eres un analista de onboarding B2B. Extrae solo JSON valido sin markdown.";
    const userPrompt = `Analiza este contenido y devuelve este JSON exacto:\n{\n  \"oneLiner\": \"\",\n  \"industry\": \"\",\n  \"mainPain\": \"\",\n  \"mainOutcome\": \"\",\n  \"differentiator\": \"\",\n  \"confidence\": {\n    \"oneLiner\": 0,\n    \"industry\": 0,\n    \"mainPain\": 0,\n    \"mainOutcome\": 0,\n    \"differentiator\": 0\n  }\n}\n\nContenido:\n${content}`;

    const fallback = buildPrefillFallback(body.websiteUrl, body.scrapedContent);

    try {
      const ai = await generateWithAI({
        task: "wizard_prefill",
        systemPrompt,
        userPrompt,
        businessId: body.businessId,
        metadata: { source: "wizard_prefill" },
      });

      const parsed = safeParsePrefill(ai.content);
      return NextResponse.json(parsed ?? fallback);
    } catch {
      return NextResponse.json(fallback);
    }
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not generate wizard prefill.",
        prefill: EMPTY_PREFILL,
      },
      { status: 500 }
    );
  }
}

function safeParsePrefill(raw: string): PrefillResponseBody | null {
  try {
    const normalized = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    const parsed = JSON.parse(normalized) as Partial<PrefillResponseBody>;

    return {
      oneLiner: parsed.oneLiner ?? "",
      industry: parsed.industry ?? "",
      mainPain: parsed.mainPain ?? "",
      mainOutcome: parsed.mainOutcome ?? "",
      differentiator: parsed.differentiator ?? "",
      confidence: {
        oneLiner: clamp(parsed.confidence?.oneLiner),
        industry: clamp(parsed.confidence?.industry),
        mainPain: clamp(parsed.confidence?.mainPain),
        mainOutcome: clamp(parsed.confidence?.mainOutcome),
        differentiator: clamp(parsed.confidence?.differentiator),
      },
    };
  } catch {
    return null;
  }
}

function clamp(value: unknown): number {
  const numberValue = typeof value === "number" ? value : Number(value ?? 0);
  if (Number.isNaN(numberValue)) return 0;
  return Math.max(0, Math.min(1, numberValue));
}

function buildPrefillFallback(
  websiteUrl?: string,
  scrapedContent?: string
): PrefillResponseBody {
  const company = inferCompanyName(websiteUrl);
  const raw = (scrapedContent ?? websiteUrl ?? "").toLowerCase();

  const industry = inferIndustry(raw);
  const oneLiner = company
    ? `${company} ayuda a empresas de ${industry.toLowerCase()} a mejorar su conversion comercial.`
    : `Ayudamos a empresas de ${industry.toLowerCase()} a mejorar su conversion comercial.`;

  return {
    oneLiner,
    industry,
    mainPain: "Generan interacciones, pero no convierten suficientes oportunidades en ventas.",
    mainOutcome: "Incrementar conversion comercial con proceso de seguimiento en 90 dias.",
    differentiator:
      "Sistema operativo de seguimiento comercial con mensajes, cadencias y prioridades por etapa.",
    confidence: {
      oneLiner: 0.45,
      industry: 0.35,
      mainPain: 0.25,
      mainOutcome: 0.25,
      differentiator: 0.2,
    },
  };
}

function inferCompanyName(url?: string): string {
  if (!url) return "";

  try {
    const normalized = url.startsWith("http") ? url : `https://${url}`;
    const hostname = new URL(normalized).hostname.replace(/^www\./, "");
    const root = hostname.split(".")[0] ?? "";

    return root
      .split(/[-_]/)
      .filter(Boolean)
      .map((value) => value.charAt(0).toUpperCase() + value.slice(1))
      .join(" ");
  } catch {
    return "";
  }
}

function inferIndustry(content: string): string {
  if (content.includes("credito") || content.includes("financ")) {
    return "Servicios financieros";
  }
  if (content.includes("saas") || content.includes("software") || content.includes("tecnolog")) {
    return "Tecnologia B2B";
  }
  if (content.includes("inmobili") || content.includes("real estate")) {
    return "Servicios inmobiliarios";
  }
  if (content.includes("agencia") || content.includes("marketing")) {
    return "Marketing y ventas";
  }

  return "Servicios profesionales";
}
