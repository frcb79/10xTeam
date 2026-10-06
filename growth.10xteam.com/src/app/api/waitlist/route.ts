import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

const CAPACITY = 1000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SERVICE_TYPE = "growth_early_access";
const SOURCE = "growth_contact";

async function getStats() {
  const supabase = createServiceClient();
  if (!supabase) return null;

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const [totalResult, recentResult] = await Promise.all([
    supabase.from("contact_leads").select("*", { count: "exact", head: true }).eq("source", SOURCE).eq("service_type", SERVICE_TYPE),
    supabase.from("contact_leads").select("*", { count: "exact", head: true }).eq("source", SOURCE).eq("service_type", SERVICE_TYPE).gte("created_at", since),
  ]);

  if (totalResult.error || recentResult.error) return null;
  const total = Math.min(totalResult.count ?? 0, CAPACITY);
  return { total, recent24h: recentResult.count ?? 0, capacity: CAPACITY, remaining: Math.max(CAPACITY - total, 0) };
}

export async function GET() {
  const stats = await getStats();
  if (!stats) return NextResponse.json({ error: "No se pudo consultar la waitlist." }, { status: 503 });
  return NextResponse.json(stats, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 160) : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 200) : "";
    const company = typeof body.company === "string" ? body.company.trim().slice(0, 200) : "";
    const phone = typeof body.phone === "string" ? body.phone.trim().slice(0, 40) : "";

    if (!name || !company || !email || !EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ error: "Nombre, empresa y un email válido son obligatorios." }, { status: 400 });
    }

    const supabase = createServiceClient();
    if (!supabase) return NextResponse.json({ error: "Servicio temporalmente no disponible." }, { status: 503 });

    const { data: existing } = await supabase
      .from("contact_leads")
      .select("id")
      .eq("source", SOURCE)
      .eq("service_type", SERVICE_TYPE)
      .eq("email", email)
      .maybeSingle();

    const payload = {
      name,
      email,
      phone: phone || null,
      service_type: SERVICE_TYPE,
      message: JSON.stringify({ company }),
      source: SOURCE,
      status: "waitlist",
      updated_at: new Date().toISOString(),
    };

    let id: string | null = null;
    if (existing?.id) {
      const { data, error } = await supabase.from("contact_leads").update(payload).eq("id", existing.id).select("id").single();
      if (error) throw error;
      id = data.id;
    } else {
      const { data, error } = await supabase.from("contact_leads").insert(payload).select("id").single();
      if (error) throw error;
      id = data.id;
    }

    const stats = await getStats();
    return NextResponse.json(
      { ok: true, id, nextUrl: "/wizard/step/1?early_access=1", ...(stats ?? {}) },
      { status: existing?.id ? 200 : 201 },
    );
  } catch {
    return NextResponse.json({ error: "No pudimos registrar tu lugar. Intenta de nuevo." }, { status: 400 });
  }
}
