import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { decodeGhlSession, GHL_SESSION_COOKIE } from "@/lib/ghl/session";
import { getGhlSessionByContext } from "@/lib/ghl/repository";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const companyId = url.searchParams.get("companyId");
  const locationId = url.searchParams.get("locationId");

  if (companyId || locationId) {
    const persisted = await getGhlSessionByContext({ companyId, locationId });
    if (persisted) {
      return NextResponse.json({
        connected: true,
        source: "supabase",
        expiresAt: persisted.expiresAt,
        userType: persisted.userType,
        companyId: persisted.companyId ?? null,
        locationId: persisted.locationId ?? null,
      });
    }
  }

  const cookieStore = await cookies();
  const raw = cookieStore.get(GHL_SESSION_COOKIE)?.value;
  if (!raw) {
    return NextResponse.json({ connected: false, source: "none" });
  }

  const session = decodeGhlSession(raw);
  if (!session) {
    return NextResponse.json({ connected: false, source: "none" });
  }

  const persistedFromCookie = await getGhlSessionByContext({
    companyId: session.companyId,
    locationId: session.locationId,
  });

  if (persistedFromCookie) {
    return NextResponse.json({
      connected: true,
      source: "supabase",
      expiresAt: persistedFromCookie.expiresAt,
      userType: persistedFromCookie.userType,
      companyId: persistedFromCookie.companyId ?? null,
      locationId: persistedFromCookie.locationId ?? null,
    });
  }

  return NextResponse.json({
    connected: true,
    source: "cookie",
    expiresAt: session.expiresAt,
    userType: session.userType,
    companyId: session.companyId ?? null,
    locationId: session.locationId ?? null,
  });
}
