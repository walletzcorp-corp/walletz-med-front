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
}

export type CreateUnitPayload = Omit<
  Unit,
  "id" | "organizationId" | "unitCode"
>;
