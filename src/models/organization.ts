export interface Organization {
  id: string;
  legalName: string;
  tradeName: string;
  cnpjDigits: string;
  taxProfile: string;
  regionalConfigId: string;
}

export interface Tenant {
  id: string;
  key: string;
  status: string;
  createdAt: string;
  organization: Organization | null;
}

export type CreateOrganizationPayload = Omit<Organization, "id">;
