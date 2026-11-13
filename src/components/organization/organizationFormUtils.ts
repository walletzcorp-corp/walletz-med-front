export const TAX_PROFILE_OPTIONS = [
  { value: 'SIMPLES_NACIONAL', label: 'Simples Nacional' },
  { value: 'LUCRO_PRESUMIDO', label: 'Lucro Presumido' },
  { value: 'LUCRO_REAL', label: 'Lucro Real' },
  { value: 'MEI', label: 'MEI' },
];

export interface OrganizationFormValues {
  legalName: string;
  tradeName: string;
  cnpjDigits: string;
  taxProfile: string;
  regionalConfigId: string;
}

export type OrganizationFormErrors = Partial<Record<keyof OrganizationFormValues, string>>;

export const EMPTY_ORGANIZATION_FORM: OrganizationFormValues = {
  legalName: '',
  tradeName: '',
  cnpjDigits: '',
  taxProfile: '',
  regionalConfigId: '',
};

export function validateOrganization(values: OrganizationFormValues): OrganizationFormErrors {
  const errors: OrganizationFormErrors = {};
  if (!values.legalName.trim()) errors.legalName = 'Razão social é obrigatória';
  if (!values.tradeName.trim()) errors.tradeName = 'Nome fantasia é obrigatório';
  if (!/^\d{14}$/.test(values.cnpjDigits)) {
    errors.cnpjDigits = 'CNPJ deve conter exatamente 14 dígitos';
  }
  if (!values.taxProfile) errors.taxProfile = 'Perfil tributário é obrigatório';
  if (!values.regionalConfigId) {
    errors.regionalConfigId = 'Configuração regional é obrigatória';
  }
  return errors;
}
