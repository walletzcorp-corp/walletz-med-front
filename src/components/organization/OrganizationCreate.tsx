import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router';
import useNotifications from '../../hooks/useNotifications/useNotifications';
import type { RegionalConfiguration } from '../../models/regionalConfiguration';
import { OrganizationService } from '../../services/OrganizationService';
import { apiErrorMessage } from '../../services/ApiError';
import PageContainer from '../PageContainer';
import OrganizationForm from './OrganizationForm';
import {
  EMPTY_ORGANIZATION_FORM,
  type OrganizationFormErrors,
  type OrganizationFormValues,
  validateOrganization,
} from './organizationFormUtils';

export default function OrganizationCreate() {
  const navigate = useNavigate();
  const notifications = useNotifications();

  const [values, setValues] = React.useState<OrganizationFormValues>(EMPTY_ORGANIZATION_FORM);
  const [errors, setErrors] = React.useState<OrganizationFormErrors>({});
  const [regionalConfigs, setRegionalConfigs] = React.useState<RegionalConfiguration[]>([]);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    OrganizationService.getRegionalConfiguration()
      .then(setRegionalConfigs)
      .catch((error) => setLoadError(apiErrorMessage(error)));
  }, []);

  const handleFieldChange = (field: keyof OrganizationFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async () => {
    const validationErrors = validateOrganization(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const tenant = await OrganizationService.registerOrganization({
        legalName: values.legalName.trim(),
        tradeName: values.tradeName.trim(),
        cnpjDigits: values.cnpjDigits,
        taxProfile: values.taxProfile,
        regionalConfigId: values.regionalConfigId,
      });

      notifications.show('Organização cadastrada com sucesso.', {
        severity: 'success',
        autoHideDuration: 3000,
      });
      // Vai para a edição, onde é possível incluir as unidades
      navigate(`/organizations/${tenant.id}/edit`);
    } catch (error) {
      notifications.show(`Falha ao cadastrar organização. ${apiErrorMessage(error)}`, {
        severity: 'error',
        autoHideDuration: 5000,
      });
      setIsSubmitting(false);
    }
  };

  const pageTitle = 'Nova organização';

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[
        { title: 'Organizações', path: '/organizations' },
        { title: 'Nova' },
      ]}
    >
      <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
        {loadError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {loadError}
          </Alert>
        )}
        <OrganizationForm
          values={values}
          errors={errors}
          regionalConfigs={regionalConfigs}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          submitButtonLabel="Cadastrar"
          isSubmitting={isSubmitting}
        />
      </Box>
    </PageContainer>
  );
}
