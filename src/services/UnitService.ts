import type {
  Unit,
  UnitStatus,
  CreateUnitPayload,
  UpdateUnitPayload,
} from "../models/unit";
import { toApiError } from "./ApiError";
import { API_URL } from "./api";

const url = API_URL;

interface UnitDto {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  country: string;
  address: string;
  municipality: string;
  uf: string;
  timezone: string;
  status: UnitStatus;
  rowVersion: number;
}

// API -> front
const fromDto = (d: UnitDto): Unit => ({
  id: d.id,
  organizationId: d.organizationId,
  unitCode: d.code,
  unitName: d.name,
  unitCountry: d.country,
  unitAddress: d.address,
  unitMunicipality: d.municipality,
  unitUF: d.uf,
  unitTimezone: d.timezone,
  status: d.status,
  rowVersion: d.rowVersion,
});

// front -> API
const toDto = (p: CreateUnitPayload) => ({
  name: p.unitName.trim(),
  country: "BR",
  address: p.unitAddress.trim(),
  municipality: p.unitMunicipality.trim(),
  uf: p.unitUF.trim().toUpperCase(),
  timezone: p.unitTimezone,
});

const unitsUrl = (organizationId: string) =>
  `${url}/Unit/${organizationId}/units`;

export const UnitService = {
  getByOrganizationId: async (organizationId: string): Promise<Unit[]> => {
    const response = await fetch(unitsUrl(organizationId));

    if (!response.ok) {
      throw await toApiError(response, "Falha ao buscar unidades");
    }

    const dtos: UnitDto[] = await response.json();
    return dtos.map(fromDto);
  },

  create: async (
    organizationId: string,
    payload: CreateUnitPayload,
  ): Promise<Unit> => {
    const response = await fetch(unitsUrl(organizationId), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toDto(payload)),
    });

    if (!response.ok) {
      throw await toApiError(response, "Falha ao criar unidade");
    }

    return fromDto(await response.json());
  },

  // PUT /Unit/:organizationId/units/:id (exige rowVersion)
  update: async (
    organizationId: string,
    unitId: string,
    payload: UpdateUnitPayload,
  ): Promise<Unit> => {
    const response = await fetch(`${unitsUrl(organizationId)}/${unitId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...toDto(payload), rowVersion: payload.rowVersion }),
    });

    if (!response.ok) {
      throw await toApiError(response, "Falha ao atualizar unidade");
    }

    return fromDto(await response.json());
  },

  activate: async (organizationId: string, unitId: string): Promise<void> => {
    const response = await fetch(
      `${unitsUrl(organizationId)}/${unitId}/activate`,
      { method: "PATCH" },
    );
    if (!response.ok) {
      throw await toApiError(response, "Falha ao ativar unidade");
    }
  },

  // A API não possui DELETE de unidade: a "remoção" é feita via bloqueio.
  block: async (
    organizationId: string,
    unitId: string,
    reason: string,
  ): Promise<void> => {
    const response = await fetch(
      `${unitsUrl(organizationId)}/${unitId}/block`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      },
    );
    if (!response.ok) {
      throw await toApiError(response, "Falha ao bloquear unidade");
    }
  },
};
