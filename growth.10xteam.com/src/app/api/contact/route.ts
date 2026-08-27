import { NextResponse } from "next/server";
import { insertContactLead } from "@/lib/contact/repository";
import type { ContactLeadInput } from "@/types/contact.types";

const ALLOWED_ORIGINS = (
  process.env.CONTACT_ALLOWED_ORIGINS ??
  "https://dev.10xteam.com.mx,https://dev.10xteam.com"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 5000;

interface ContactRequestBody {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  serviceType?: unknown;
  message?: unknown;
  source?: unknown;
}

function corsHeaders(origin: string | null): Record<string, string> {
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) return {};

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);

  try {
    const body = (await request.json()) as ContactRequestBody;

    const name = typeof body.name === "string" ? body.name.trim().slice(0, MAX_NAME_LENGTH) : "";
    const email = typeof body.email === "string" ? body.email.trim().slice(0, MAX_NAME_LENGTH) : "";
    const phone = typeof body.phone === "string" ? body.phone.trim().slice(0, 40) : undefined;
    const serviceType =
      typeof body.serviceType === "string" ? body.serviceType.trim().slice(0, 80) : undefined;
    const message =
      typeof body.message === "string" ? body.message.trim().slice(0, MAX_MESSAGE_LENGTH) : undefined;
    const source = body.source === "growth_contact" ? "growth_contact" : "dev_contact";

    if (!name || !email || !EMAIL_PATTERN.test(email)) {
      return NextResponse.json(
        { error: "name y un email valido son obligatorios." },
        { status: 400, headers },
      );
    }

    const input: ContactLeadInput = { name, email, phone, serviceType, message, source };
    const record = await insertContactLead(input);

    if (!record) {
      return NextResponse.json(
        { error: "No se pudo guardar el contacto. Intenta de nuevo en unos minutos." },
        { status: 503, headers },
      );
    }

    return NextResponse.json({ ok: true, id: record.id }, { status: 201, headers });
  } catch {
    return NextResponse.json(
      { error: "Solicitud invalida." },
      { status: 400, headers },
    );
  }
}
