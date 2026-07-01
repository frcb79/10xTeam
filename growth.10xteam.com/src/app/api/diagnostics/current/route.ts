import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { DiagnosticRecord } from "@/types/diagnostic.types";

const DIAGNOSTIC_COOKIE_KEY = "diagnostic_current_v1";

interface CurrentDiagnosticBody {
  diagnostic?: DiagnosticRecord;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(DIAGNOSTIC_COOKIE_KEY)?.value;
    if (!raw) {
      return NextResponse.json({ diagnostic: null, source: "none" });
    }

    const parsed = decodeDiagnostic(raw);
    return NextResponse.json({ diagnostic: parsed, source: parsed ? "cookie" : "none" });
  } catch {
    return NextResponse.json({ diagnostic: null, source: "none" });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CurrentDiagnosticBody;
    if (!body.diagnostic) {
      return NextResponse.json({ error: "diagnostic is required." }, { status: 400 });
    }

    const response = NextResponse.json({ ok: true, source: "cookie" });
    response.cookies.set(DIAGNOSTIC_COOKIE_KEY, encodeDiagnostic(body.diagnostic), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not persist current diagnostic.",
      },
      { status: 500 },
    );
  }
}

function encodeDiagnostic(diagnostic: DiagnosticRecord): string {
  return Buffer.from(JSON.stringify(diagnostic), "utf-8").toString("base64url");
}

function decodeDiagnostic(value: string): DiagnosticRecord | null {
  try {
    const json = Buffer.from(value, "base64url").toString("utf-8");
    return JSON.parse(json) as DiagnosticRecord;
  } catch {
    return null;
  }
}
