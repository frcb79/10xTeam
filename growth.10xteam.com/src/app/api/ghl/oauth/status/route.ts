import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { decodeGhlSession, GHL_SESSION_COOKIE } from "@/lib/ghl/session";

export async function GET() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(GHL_SESSION_COOKIE)?.value;
  if (!raw) {
    return NextResponse.json({ connected: false });
  }

  const session = decodeGhlSession(raw);
  if (!session) {
    return NextResponse.json({ connected: false });
  }

  return NextResponse.json({
    connected: true,
    expiresAt: session.expiresAt,
    userType: session.userType,
    companyId: session.companyId ?? null,
    locationId: session.locationId ?? null,
  });
}
