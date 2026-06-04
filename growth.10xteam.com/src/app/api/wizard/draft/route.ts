import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { WizardData } from "@/types/icp";

const DRAFT_COOKIE_KEY = "wizard_draft_v1";

interface DraftPayload {
  step: number;
  data: WizardData;
  updatedAt: string;
}

interface DraftPostBody {
  businessId?: string;
  draft?: DraftPayload;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const businessId = url.searchParams.get("businessId");

    if (businessId) {
      const supabase = createServiceClient();
      if (supabase) {
        const { data } = await supabase
          .from("wizard_drafts")
          .select("draft")
          .eq("business_id", businessId)
          .single();

        if (data?.draft) {
          return NextResponse.json({ draft: data.draft, source: "supabase" });
        }
      }
    }

    const cookieStore = await cookies();
    const raw = cookieStore.get(DRAFT_COOKIE_KEY)?.value;
    if (!raw) return NextResponse.json({ draft: null, source: "none" });

    const decoded = decodeDraft(raw);
    return NextResponse.json({ draft: decoded, source: "cookie" });
  } catch {
    return NextResponse.json({ draft: null, source: "none" });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as DraftPostBody;

    if (!body.draft) {
      return NextResponse.json(
        { error: "draft is required." },
        { status: 400 }
      );
    }

    let source = "cookie";

    if (body.businessId) {
      const supabase = createServiceClient();
      if (supabase) {
        const { error } = await supabase
          .from("wizard_drafts")
          .upsert(
            {
              business_id: body.businessId,
              draft: body.draft,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "business_id" }
          );

        if (!error) {
          source = "supabase";
        }
      }
    }

    const response = NextResponse.json({ ok: true, source });
    response.cookies.set(DRAFT_COOKIE_KEY, encodeDraft(body.draft), {
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
            : "Could not persist wizard draft.",
      },
      { status: 500 }
    );
  }
}

function encodeDraft(draft: DraftPayload): string {
  return Buffer.from(JSON.stringify(draft), "utf-8").toString("base64url");
}

function decodeDraft(value: string): DraftPayload | null {
  try {
    const json = Buffer.from(value, "base64url").toString("utf-8");
    return JSON.parse(json) as DraftPayload;
  } catch {
    return null;
  }
}
