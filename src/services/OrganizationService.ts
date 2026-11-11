import type {
  Organization,
  CreateOrganizationPayload,
  Tenant,
} from "../models/organization";
import type { RegionalConfiguration } from "../models/regionalConfiguration";

const url = "http://localhost:3001";

export const OrganizationService = {
  registerOrganization: async (
    payload: CreateOrganizationPayload,
  ): Promise<Organization> => {
    const response = await fetch(`${url}/tenants`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Falha ao registrar organização");
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
};
