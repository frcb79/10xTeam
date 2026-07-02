import { createServiceClient } from "@/lib/supabase/service";
import type { GhlOAuthSession } from "@/types/ghl.types";

interface GhlSessionRow {
  company_id: string | null;
  location_id: string | null;
  user_id: string | null;
  user_type: string | null;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  scope: string | null;
  metadata: Record<string, unknown> | null;
  updated_at: string;
}

function mapRowToSession(row: GhlSessionRow): GhlOAuthSession {
  return {
    accessToken: row.access_token,
    refreshToken: row.refresh_token,
    expiresAt: row.expires_at,
    scope: row.scope ?? undefined,
    userType: row.user_type ?? undefined,
    companyId: row.company_id ?? undefined,
    locationId: row.location_id ?? undefined,
    userId: row.user_id ?? undefined,
  };
}

function normalizeExpiresAt(value: string): string {
  const asDate = new Date(value);
  if (Number.isNaN(asDate.getTime())) {
    return new Date(Date.now() + 60 * 60 * 1000).toISOString();
  }
  return asDate.toISOString();
}

export async function upsertGhlSession(session: GhlOAuthSession): Promise<boolean> {
  const supabase = createServiceClient();
  if (!supabase) return false;

  if (!session.companyId && !session.locationId) {
    return false;
  }

  const payload = {
    company_id: session.companyId ?? null,
    location_id: session.locationId ?? null,
    user_id: session.userId ?? null,
    user_type: session.userType ?? null,
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
    expires_at: normalizeExpiresAt(session.expiresAt),
    scope: session.scope ?? null,
    metadata: {},
    updated_at: new Date().toISOString(),
  };

  const conflictTarget = session.companyId ? "company_id" : "location_id";

  const { error } = await supabase
    .from("ghl_sessions")
    .upsert(payload, { onConflict: conflictTarget });

  return !error;
}

export async function getGhlSessionByContext(input: {
  companyId?: string | null;
  locationId?: string | null;
}): Promise<GhlOAuthSession | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;

  const companyId = input.companyId?.trim();
  const locationId = input.locationId?.trim();
  if (!companyId && !locationId) return null;

  let query = supabase
    .from("ghl_sessions")
    .select(
      "company_id, location_id, user_id, user_type, access_token, refresh_token, expires_at, scope, metadata, updated_at",
    )
    .limit(1);

  if (locationId) {
    query = query.eq("location_id", locationId);
  } else if (companyId) {
    query = query.eq("company_id", companyId);
  }

  const { data, error } = await query.single();
  if (error || !data) return null;

  return mapRowToSession(data as GhlSessionRow);
}

export async function touchGhlSessionByContext(input: {
  companyId?: string | null;
  locationId?: string | null;
  eventType?: string;
}): Promise<boolean> {
  const supabase = createServiceClient();
  if (!supabase) return false;

  const companyId = input.companyId?.trim();
  const locationId = input.locationId?.trim();
  if (!companyId && !locationId) return false;

  let query = supabase
    .from("ghl_sessions")
    .select("metadata")
    .limit(1);

  if (locationId) {
    query = query.eq("location_id", locationId);
  } else if (companyId) {
    query = query.eq("company_id", companyId);
  }

  const { data, error } = await query.single();
  if (error || !data) return false;

  const previousMetadata = (data.metadata ?? {}) as Record<string, unknown>;
  const metadata: Record<string, unknown> = {
    ...previousMetadata,
    lastWebhookAt: new Date().toISOString(),
    lastWebhookEvent: input.eventType ?? previousMetadata.lastWebhookEvent ?? null,
  };

  let update = supabase
    .from("ghl_sessions")
    .update({ metadata, updated_at: new Date().toISOString() });

  if (locationId) {
    update = update.eq("location_id", locationId);
  } else if (companyId) {
    update = update.eq("company_id", companyId);
  }

  const { error: updateError } = await update;
  return !updateError;
}
