import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { DiagnosticRecord, DiagnosticStatus } from "@/types/diagnostic.types";
import {
  findDiagnosticRecordById,
  updateDiagnosticRecordStatusById,
  upsertDiagnosticRecord,
} from "@/lib/diagnostics/repository";

const DIAGNOSTIC_COOKIE_KEY = "diagnostic_current_v1";

interface CurrentDiagnosticBody {
  diagnostic?: DiagnosticRecord;
  status?: DiagnosticStatus;
  diagnosticId?: string;
}

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const diagnosticId = requestUrl.searchParams.get("diagnosticId");

    if (diagnosticId) {
      const persisted = await findDiagnosticRecordById(diagnosticId);
      if (persisted) {
        return NextResponse.json({ diagnostic: persisted, source: "supabase" });
      }
    }

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

    await upsertDiagnosticRecord(body.diagnostic);

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

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as CurrentDiagnosticBody;
    if (!body.status) {
      return NextResponse.json({ error: "status is required." }, { status: 400 });
    }

    if (body.diagnosticId) {
      const persisted = await updateDiagnosticRecordStatusById(body.diagnosticId, body.status);
      if (persisted) {
        const response = NextResponse.json({ ok: true, diagnostic: persisted, source: "supabase" });

        response.cookies.set(DIAGNOSTIC_COOKIE_KEY, encodeDiagnostic(persisted), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 14,
        });

        return response;
      }
    }

    const cookieStore = await cookies();
    const raw = cookieStore.get(DIAGNOSTIC_COOKIE_KEY)?.value;
    const current = raw ? decodeDiagnostic(raw) : null;

    if (!current) {
      return NextResponse.json({ error: "No current diagnostic found." }, { status: 404 });
    }

    const updated: DiagnosticRecord = {
      ...current,
      status: body.status,
    };

    await upsertDiagnosticRecord(updated);

    const response = NextResponse.json({ ok: true, diagnostic: updated, source: "cookie" });
    response.cookies.set(DIAGNOSTIC_COOKIE_KEY, encodeDiagnostic(updated), {
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
            : "Could not update current diagnostic status.",
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
