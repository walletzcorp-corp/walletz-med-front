import type {
  Organization,
  CreateOrganizationPayload,
  Tenant,
  PaginatedResult,
  UpdateOrganizationPayload,
} from "../models/organization";
import type { RegionalConfiguration } from "../models/regionalConfiguration";
import { toApiError } from "./ApiError";

import { API_URL } from "./api";

const url = API_URL;

export const OrganizationService = {
  // POST /tenants -> cria tenant + organização e devolve o tenant
  registerOrganization: async (
    payload: CreateOrganizationPayload,
  ): Promise<Tenant> => {
    const response = await fetch(`${url}/tenants`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw await toApiError(response, "Falha ao registrar organização");
    }

    return response.json();
  },

  getRegionalConfiguration: async (): Promise<RegionalConfiguration[]> => {
    const response = await fetch(`${url}/regional-configurations`);

    if (!response.ok) {
      throw new Error("Falha ao buscar configurações regionais");
    }

    return response.json();
  },

  getOrganizations: async (): Promise<Organization[]> => {
    const response = await fetch(`${url}/tenants`);

    if (!response.ok) {
      throw new Error("Falha ao buscar organizações");
    }

    const tenants: Tenant[] = await response.json();

    return tenants
      .map((tenant) => tenant.organization)
      .filter(
        (organization): organization is Organization => organization !== null,
      );
  },

  // GET /organizations?page=&limit= -> { data, meta } (page começa em 1)
  getOrganizationsPaginated: async (
    page: number,
    limit: number,
  ): Promise<PaginatedResult<Organization>> => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    const response = await fetch(`${url}/organizations?${params}`);

    if (!response.ok) {
      throw await toApiError(response, "Falha ao buscar organizações");
    }

    return response.json();
  },

  // GET /tenants/:tenantId/organization
  getOrganizationByTenant: async (tenantId: string): Promise<Organization> => {
    const response = await fetch(`${url}/tenants/${tenantId}/organization`);

    if (!response.ok) {
      throw await toApiError(response, "Falha ao buscar organização");
    }

    return response.json();
  },

  // PATCH /tenants/:tenantId/organization (204, exige rowVersion)
  updateOrganization: async (
    tenantId: string,
    payload: UpdateOrganizationPayload,
  ): Promise<void> => {
    const response = await fetch(`${url}/tenants/${tenantId}/organization`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw await toApiError(response, "Falha ao atualizar organização");
    }
  },
};
