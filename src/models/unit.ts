export type UnitStatus = "RASCUNHO" | "ATIVA" | "INATIVA" | "BLOQUEADA";

export interface Unit {
  id: string;
  organizationId: string;
  unitCode: string;
  unitName: string;
  unitCountry: string;
  unitAddress: string;
  unitMunicipality: string;
  unitUF: string;
  unitTimezone: string;
  status: UnitStatus;
  rowVersion: number;
}

// O que o formulário envia. País é fixo ("BR") e fica por conta do UnitService.
export type CreateUnitPayload = Omit<
  Unit,
  "id" | "organizationId" | "unitCode" | "unitCountry" | "status" | "rowVersion"
>;
