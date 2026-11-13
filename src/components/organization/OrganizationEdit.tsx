import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import { useParams } from 'react-router';
import useNotifications from '../../hooks/useNotifications/useNotifications';
import type { Organization } from '../../models/organization';
import type { RegionalConfiguration } from '../../models/regionalConfiguration';
import { OrganizationService } from '../../services/OrganizationService';
import { apiErrorMessage } from '../../services/ApiError';
import PageContainer from '../PageContainer';
import UnitGrid from '../unit/UnitGrid';
import OrganizationForm from './OrganizationForm';
import {
  type OrganizationFormErrors,
  type OrganizationFormValues,
  validateOrganization,
} from './organizationFormUtils';

function toFormValues(organization: Organization): OrganizationFormValues {
  return {
    legalName: organization.legalName,
    tradeName: organization.tradeName,
    cnpjDigits: organization.cnpjDigits,
    taxProfile: organization.taxProfile,
    regionalConfigId: organization.regionalConfigId,
  };
}

export default function OrganizationEdit() {
  const { tenantId } = useParams();
  const notifications = useNotifications();

  const [organization, setOrganization] = React.useState<Organization | null>(null);
  const [regionalConfigs, setRegionalConfigs] = React.useState<RegionalConfiguration[]>([]);
  const [values, setValues] = React.useState<OrganizationFormValues | null>(null);
  const [errors, setErrors] = React.useState<OrganizationFormErrors>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    if (!tenantId) return;
    setLoadError(null);
    setIsLoading(true);

    try {
      const [org, configs] = await Promise.all([
        OrganizationService.getOrganizationByTenant(tenantId),
        OrganizationService.getRegionalConfiguration(),
      ]);
      setOrganization(org);
      setRegionalConfigs(configs);
      setValues(toFormValues(org));
    } catch (error) {
      setLoadError(apiErrorMessage(error));
    }

    setIsLoading(false);
  }, [tenantId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFieldChange = (field: keyof OrganizationFormValues, value: string) => {
    setValues((prev) => (prev ? { ...prev, [field]: value } : prev));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async () => {
    if (!values || !organization || !tenantId) return;

    const validationErrors = validateOrganization(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await OrganizationService.updateOrganization(tenantId, {
        legalName: values.legalName.trim(),
        tradeName: values.tradeName.trim(),
        cnpjDigits: values.cnpjDigits,
        taxProfile: values.taxProfile,
        regionalConfigId: values.regionalConfigId,
        rowVersion: organization.rowVersion,
      });

      notifications.show('Organização atualizada com sucesso.', {
        severity: 'success',
        autoHideDuration: 3000,
      });
      // Recarrega para obter o novo rowVersion
      await loadData();
    } catch (error) {
      notifications.show(`Falha ao atualizar organização. ${apiErrorMessage(error)}`, {
        severity: 'error',
        autoHideDuration: 5000,
      });
    }
    setIsSubmitting(false);
  };

  const handleReset = () => {
    if (organization) {
      setValues(toFormValues(organization));
      setErrors({});
    }
  };

  const pageTitle = organization ? `Editar ${organization.tradeName}` : 'Editar organização';

  const renderContent = () => {
    if (isLoading && !values) {
      return (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', m: 1 }}>
          <CircularProgress />
        </Box>
      );
    }
    if (loadError) {
      return <Alert severity="error">{loadError}</Alert>;
    }
    if (!values || !organization) return null;

    return (
      <Stack spacing={4}>
        <OrganizationForm
          values={values}
          errors={errors}
          regionalConfigs={regionalConfigs}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          onReset={handleReset}
          submitButtonLabel="Salvar"
          isSubmitting={isSubmitting}
        />

        <Divider />

        <UnitGrid organizationId={organization.id} />
      </Stack>
    );
  };

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[
        { title: 'Organizações', path: '/organizations' },
        { title: 'Editar' },
      ]}
    >
      <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column' }}>{renderContent()}</Box>
    </PageContainer>
  );
}
