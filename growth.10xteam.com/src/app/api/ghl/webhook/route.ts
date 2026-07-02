import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { DiagnosticRecord, DiagnosticStatus } from "@/types/diagnostic.types";
import {
  findDiagnosticRecordById,
  updateDiagnosticRecordStatusById,
} from "@/lib/diagnostics/repository";
import { touchGhlSessionByContext } from "@/lib/ghl/repository";

const DIAGNOSTIC_COOKIE_KEY = "diagnostic_current_v1";

interface GhlWebhookBody {
  eventType?: string;
  event?: string;
  type?: string;
  diagnosticId?: string;
  status?: DiagnosticStatus;
  companyId?: string;
  locationId?: string;
  company?: { id?: string };
  location?: { id?: string };
}

const EVENT_STATUS_MAP: Record<string, DiagnosticStatus> = {
  appointment_booked: "call_booked",
  calendar_booked: "call_booked",
  call_booked: "call_booked",
  trial_activated: "activated",
  app_install: "activated",
  activated: "activated",
};

export async function POST(request: Request) {
  const webhookSecret = process.env.GHL_WEBHOOK_SECRET;
  const providedSecret = request.headers.get("x-ghl-webhook-secret");

  if (webhookSecret && providedSecret !== webhookSecret) {
    return NextResponse.json({ error: "Unauthorized webhook request." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as GhlWebhookBody;
    const normalizedEvent =
      (body.eventType ?? body.event ?? body.type ?? "").toString().trim().toLowerCase();

    const companyId = body.companyId ?? body.company?.id;
    const locationId = body.locationId ?? body.location?.id;

    if (companyId || locationId) {
      await touchGhlSessionByContext({
        companyId,
        locationId,
        eventType: normalizedEvent || undefined,
      });
    }

    const targetStatus = body.status ?? EVENT_STATUS_MAP[normalizedEvent];
    if (!targetStatus) {
      return NextResponse.json(
        {
          ok: true,
          ignored: true,
          reason: "No status mapping for received event.",
          receivedEvent: normalizedEvent || null,
        },
        { status: 202 },
      );
    }

    if (body.diagnosticId) {
      const updatedById = await updateDiagnosticRecordStatusById(body.diagnosticId, targetStatus);
      if (updatedById) {
        return NextResponse.json({
          ok: true,
          mappedStatus: targetStatus,
          source: "supabase",
          diagnostic: updatedById,
        });
      }

      const existingById = await findDiagnosticRecordById(body.diagnosticId);
      if (existingById) {
        return NextResponse.json(
          {
            ok: true,
            mappedStatus: targetStatus,
            warning: "Diagnostic found but status update failed in Supabase.",
          },
          { status: 202 },
        );
      }
    }

    const cookieStore = await cookies();
    const raw = cookieStore.get(DIAGNOSTIC_COOKIE_KEY)?.value;
    const current = raw ? decodeDiagnostic(raw) : null;

    if (!current) {
      return NextResponse.json(
        {
          ok: true,
          mappedStatus: targetStatus,
          warning:
            "No diagnostic cookie found in this request context. Configure server persistence to apply webhook updates globally.",
        },
        { status: 202 },
      );
    }

    if (body.diagnosticId && body.diagnosticId !== current.id) {
      return NextResponse.json(
        {
          ok: true,
          mappedStatus: targetStatus,
          warning: "Diagnostic ID does not match current context.",
        },
        { status: 202 },
      );
    }

    const updated: DiagnosticRecord = {
      ...current,
      status: targetStatus,
    };

    const response = NextResponse.json({ ok: true, mappedStatus: targetStatus, diagnostic: updated });
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
          error instanceof Error ? error.message : "Could not process GHL webhook.",
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
