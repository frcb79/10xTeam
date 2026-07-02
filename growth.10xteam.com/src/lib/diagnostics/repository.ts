import { createServiceClient } from "@/lib/supabase/service";
import type { DiagnosticRecord, DiagnosticStatus } from "@/types/diagnostic.types";

interface UpsertOptions {
  companyId?: string | null;
  locationId?: string | null;
  source?: string;
}

export async function upsertDiagnosticRecord(
  diagnostic: DiagnosticRecord,
  options?: UpsertOptions,
): Promise<boolean> {
  const supabase = createServiceClient();
  if (!supabase) return false;

  const { error } = await supabase.from("diagnostic_records").upsert(
    {
      id: diagnostic.id,
      status: diagnostic.status,
      business_name: diagnostic.businessName,
      contact: diagnostic.contact ?? {},
      payload: diagnostic,
      company_id: options?.companyId ?? null,
      location_id: options?.locationId ?? null,
      source: options?.source ?? "wizard",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  return !error;
}

export async function findDiagnosticRecordById(id: string): Promise<DiagnosticRecord | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("diagnostic_records")
    .select("payload")
    .eq("id", id)
    .single();

  if (error || !data?.payload) return null;
  return data.payload as DiagnosticRecord;
}

export async function updateDiagnosticRecordStatusById(
  id: string,
  status: DiagnosticStatus,
): Promise<DiagnosticRecord | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;

  const { data: current, error: currentError } = await supabase
    .from("diagnostic_records")
    .select("payload")
    .eq("id", id)
    .single();

  if (currentError || !current?.payload) return null;

  const payload = current.payload as DiagnosticRecord;
  const updatedPayload: DiagnosticRecord = {
    ...payload,
    status,
  };

  const { error } = await supabase
    .from("diagnostic_records")
    .update({ status, payload: updatedPayload, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return null;
  return updatedPayload;
}
