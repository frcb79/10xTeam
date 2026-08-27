export type ContactLeadSource = "dev_contact" | "growth_contact";

export interface ContactLeadInput {
  name: string;
  email: string;
  phone?: string;
  serviceType?: string;
  message?: string;
  source: ContactLeadSource;
}

export interface ContactLeadRecord extends ContactLeadInput {
  id: string;
  status: string;
  createdAt: string;
}
