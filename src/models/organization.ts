export interface Organization {
  id: string;
  tenantId: string;
  legalName: string;
  tradeName: string;
  cnpjDigits: string;
  taxProfile: string;
  regionalConfigId: string;
  status: string;
  rowVersion: number;
}

export interface Tenant {
  id: string;
  key: string;
  status: string;
  createdAt: string;
  organization: Organization | null;
}

export type CreateOrganizationPayload = Omit<
  Organization,
  "id" | "tenantId" | "status" | "rowVersion"
>;

// PATCH /tenants/:tenantId/organization
export type UpdateOrganizationPayload = CreateOrganizationPayload & {
  rowVersion: number;
};

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}
