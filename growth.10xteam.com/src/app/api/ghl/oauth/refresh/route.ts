import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { refreshAccessToken } from "@/lib/ghl/client";
import { decodeGhlSession, encodeGhlSession, GHL_SESSION_COOKIE } from "@/lib/ghl/session";
import { upsertGhlSession } from "@/lib/ghl/repository";

export async function POST() {
  const clientId = process.env.GHL_CLIENT_ID;
  const clientSecret = process.env.GHL_CLIENT_SECRET;
  const redirectUri = process.env.GHL_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json(
      {
        error:
          "Missing GHL OAuth env vars. Required: GHL_CLIENT_ID, GHL_CLIENT_SECRET, GHL_REDIRECT_URI.",
      },
      { status: 500 },
    );
  }

  const cookieStore = await cookies();
  const raw = cookieStore.get(GHL_SESSION_COOKIE)?.value;
  if (!raw) {
    return NextResponse.json({ error: "No GHL session found." }, { status: 401 });
  }

  const existing = decodeGhlSession(raw);
  if (!existing?.refreshToken) {
    return NextResponse.json({ error: "Invalid GHL session." }, { status: 401 });
  }

  try {
    const refreshed = await refreshAccessToken({
      refreshToken: existing.refreshToken,
      clientId,
      clientSecret,
      redirectUri,
      userType: "Company",
    });

    const mergedSession = {
      ...refreshed,
      companyId: refreshed.companyId ?? existing.companyId,
      locationId: refreshed.locationId ?? existing.locationId,
      userId: refreshed.userId ?? existing.userId,
      userType: refreshed.userType ?? existing.userType,
      scope: refreshed.scope ?? existing.scope,
    };

    await upsertGhlSession(mergedSession);

    const response = NextResponse.json({ ok: true, expiresAt: mergedSession.expiresAt });
    response.cookies.set(GHL_SESSION_COOKIE, encodeGhlSession(mergedSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Could not refresh GHL token.",
      },
      { status: 500 },
    );
  }
}
