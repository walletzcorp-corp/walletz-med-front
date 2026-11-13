import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router';
import type { RegionalConfiguration } from '../../models/regionalConfiguration';
import {
  TAX_PROFILE_OPTIONS,
  type OrganizationFormErrors,
  type OrganizationFormValues,
} from './organizationFormUtils';

export interface OrganizationFormProps {
  values: OrganizationFormValues;
  errors: OrganizationFormErrors;
  regionalConfigs: RegionalConfiguration[];
  onFieldChange: (field: keyof OrganizationFormValues, value: string) => void;
  onSubmit: () => void | Promise<void>;
  onReset?: () => void;
  submitButtonLabel: string;
  isSubmitting: boolean;
  backButtonPath?: string;
}

export default function OrganizationForm({
  values,
  errors,
  regionalConfigs,
  onFieldChange,
  onSubmit,
  onReset,
  submitButtonLabel,
  isSubmitting,
  backButtonPath = '/organizations',
}: OrganizationFormProps) {
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  const handleTextChange =
    (field: keyof OrganizationFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      let value = event.target.value;
      if (field === 'cnpjDigits') value = value.replace(/\D/g, '').slice(0, 14);
      onFieldChange(field, value);
    };

  const handleSelectChange =
    (field: keyof OrganizationFormValues) => (event: SelectChangeEvent) => {
      onFieldChange(field, event.target.value);
    };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off">
      <Grid container spacing={2} sx={{ mb: 2, width: '100%' }}>
        <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
          <TextField
            value={values.legalName}
            onChange={handleTextChange('legalName')}
            name="legalName"
            label="Razão social"
            error={!!errors.legalName}
            helperText={errors.legalName ?? ' '}
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
          <TextField
            value={values.tradeName}
            onChange={handleTextChange('tradeName')}
            name="tradeName"
            label="Nome fantasia"
            error={!!errors.tradeName}
            helperText={errors.tradeName ?? ' '}
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
          <TextField
            value={values.cnpjDigits}
            onChange={handleTextChange('cnpjDigits')}
            name="cnpjDigits"
            label="CNPJ (somente números)"
            error={!!errors.cnpjDigits}
            helperText={errors.cnpjDigits ?? ' '}
            slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 14 } }}
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
          <FormControl error={!!errors.taxProfile} fullWidth>
            <InputLabel id="org-tax-profile-label">Perfil tributário</InputLabel>
            <Select
              value={values.taxProfile}
              onChange={handleSelectChange('taxProfile')}
              labelId="org-tax-profile-label"
              name="taxProfile"
              label="Perfil tributário"
              fullWidth
            >
              {TAX_PROFILE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{errors.taxProfile ?? ' '}</FormHelperText>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
          <FormControl error={!!errors.regionalConfigId} fullWidth>
            <InputLabel id="org-regional-config-label">Configuração regional</InputLabel>
            <Select
              value={values.regionalConfigId}
              onChange={handleSelectChange('regionalConfigId')}
              labelId="org-regional-config-label"
              name="regionalConfigId"
              label="Configuração regional"
              fullWidth
            >
              {regionalConfigs.map((config) => (
                <MenuItem key={config.id} value={config.id}>
                  {config.name}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{errors.regionalConfigId ?? ' '}</FormHelperText>
          </FormControl>
        </Grid>
      </Grid>
      <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(backButtonPath)}
        >
          Voltar
        </Button>
        <Stack direction="row" spacing={2}>
          {onReset && (
            <Button variant="outlined" onClick={onReset} disabled={isSubmitting}>
              Desfazer
            </Button>
          )}
          <Button type="submit" variant="contained" size="large" loading={isSubmitting}>
            {submitButtonLabel}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
