import { createServiceClient } from "@/lib/supabase/service";
import type { ContactLeadInput, ContactLeadRecord } from "@/types/contact.types";

interface ContactLeadRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  service_type: string | null;
  message: string | null;
  source: string;
  status: string;
  created_at: string;
}

function mapRowToRecord(row: ContactLeadRow): ContactLeadRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? undefined,
    serviceType: row.service_type ?? undefined,
    message: row.message ?? undefined,
    source: row.source as ContactLeadInput["source"],
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function insertContactLead(
  input: ContactLeadInput,
): Promise<ContactLeadRecord | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("contact_leads")
    .insert({
      name: input.name,
      email: input.email,
      phone: input.phone ?? null,
      service_type: input.serviceType ?? null,
      message: input.message ?? null,
      source: input.source,
    })
    .select()
    .single();

  if (error || !data) return null;

  return mapRowToRecord(data as ContactLeadRow);
}
