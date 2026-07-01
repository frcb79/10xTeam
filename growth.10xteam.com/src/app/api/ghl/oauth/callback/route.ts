import { NextResponse } from "next/server";
import { exchangeAuthorizationCode } from "@/lib/ghl/client";
import { encodeGhlSession, GHL_SESSION_COOKIE } from "@/lib/ghl/session";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing OAuth code." }, { status: 400 });
  }

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

  try {
    const session = await exchangeAuthorizationCode({
      code,
      clientId,
      clientSecret,
      redirectUri,
      userType: "Company",
    });

    const response = NextResponse.redirect(new URL("/dashboard?ghl=connected", url.origin));
    response.cookies.set(GHL_SESSION_COOKIE, encodeGhlSession(session), {
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
        error:
          error instanceof Error
            ? error.message
            : "Could not complete GHL OAuth callback.",
      },
      { status: 500 },
    );
  }
}
