import { NextResponse } from "next/server";

const TEAM_ACCESS_COOKIE = "team_access_v1";

interface SessionBody {
  passcode?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SessionBody;
    const expected = process.env.TEAM_ADMIN_PASSCODE;

    if (!expected) {
      return NextResponse.json(
        { error: "TEAM_ADMIN_PASSCODE is not configured." },
        { status: 500 },
      );
    }

    if (!body.passcode || body.passcode !== expected) {
      return NextResponse.json({ error: "Invalid passcode." }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(TEAM_ACCESS_COOKIE, "owner", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Could not create team session." }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(TEAM_ACCESS_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
