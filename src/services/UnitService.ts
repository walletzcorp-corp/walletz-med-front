import { Unit, UnitStatus, CreateUnitPayload } from "../models/unit";
import { toApiError } from "./ApiError";

const url = "http://localhost:3001";

interface UnitDto{
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

//front -> API
const toDto = (p: CreateUnitPayload) => ({
  name: p.unitName.trim(),
  country: "BR", 
  address: p.unitAddress.trim(),
  municipality: p.unitMunicipality.trim(),
  uf: p.unitUF.trim().toUpperCase(),
  timezone: p.unitTimezone,
});

export const UnitService = {
    getByOrganizationId: async (organizationId: string): Promise<Unit[]> => {
    const response = await fetch(`${url}/Unit/${organizationId}/units`);

    if (!response.ok) {
      throw new Error("Falha ao buscar unidades");
    }

    const dtos: UnitDto[] = await response.json();
    return dtos.map(fromDto);
  },

  create: async (
    organizationId: string,
    payload: CreateUnitPayload,
): Promise<Unit> => {
    const response = await fetch(`${url}/Unit/${organizationId}/units`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error("Falha ao criar unidade");
    }

    return response.json();
  },

  activate: async (organizationId: string, unitId: string): Promise<void> =>{
    const response = await fetch(
        `${url}/Unit/${organizationId}/units/${unitId}/activate`,
        {method: "PATCH"},
    );
    if(!response.ok){
        throw await toApiError(response, "Falha ao ativar unidade");
    }
  }
};


