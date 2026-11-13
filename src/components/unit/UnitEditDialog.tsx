import * as React from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import type { Unit, CreateUnitPayload } from '../../models/unit';
import { UnitService } from '../../services/UnitService';
import { ApiError } from '../../services/ApiError';
import { getTimezoneByCountry } from '../../utils/timezoneUtils';

const BR_TIMEZONES = getTimezoneByCountry('BR');

type FormValues = CreateUnitPayload;
type FormErrors = Partial<Record<keyof FormValues, string>>;

const EMPTY_FORM: FormValues = {
  unitName: '',
  unitAddress: '',
  unitMunicipality: '',
  unitUF: '',
  unitTimezone: 'America/Sao_Paulo',
};

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.unitName.trim()) errors.unitName = 'Nome é obrigatório';
  if (!values.unitAddress.trim()) errors.unitAddress = 'Endereço é obrigatório';
  if (!values.unitMunicipality.trim()) errors.unitMunicipality = 'Município é obrigatório';
  if (!/^[A-Za-z]{2}$/.test(values.unitUF.trim())) errors.unitUF = 'UF deve ter 2 letras';
  if (!values.unitTimezone) errors.unitTimezone = 'Fuso horário é obrigatório';
  return errors;
}

function toFormValues(unit: Unit): FormValues {
  return {
    unitName: unit.unitName ?? '',
    unitAddress: unit.unitAddress ?? '',
    unitMunicipality: unit.unitMunicipality ?? '',
    unitUF: unit.unitUF ?? '',
    unitTimezone: unit.unitTimezone ?? '',
  };
}

interface Props {
  open: boolean;
  organizationId: string;
  /** Unidade a editar. `null` = modo de inclusão. */
  unit: Unit | null;
  onClose: () => void;
  onSaved: (mode: 'create' | 'edit') => void;
}

/**
 * Modal de inclusão/edição de unidade.
 * O componente pai deve trocar a `key` a cada abertura para reiniciar o formulário.
 */
export default function UnitEditDialog({ open, organizationId, unit, onClose, onSaved }: Props) {
  const isEdit = !!unit;

  const [values, setValues] = React.useState<FormValues>(
    unit ? toFormValues(unit) : EMPTY_FORM,
  );
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [submitError, setSubmitError] = React.useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleTextChange =
    (field: keyof FormValues) => (event: React.ChangeEvent<HTMLInputElement>) => {
      let value = event.target.value;
      if (field === 'unitUF') value = value.toUpperCase().slice(0, 2);
      setValues((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const handleTimezoneChange = (event: SelectChangeEvent) => {
    const { value } = event.target;
    setValues((prev) => ({ ...prev, unitTimezone: value }));
    setErrors((prev) => ({ ...prev, unitTimezone: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    setSubmitError([]);
    try {
      if (unit) {
        await UnitService.update(organizationId, unit.id, {
          ...values,
          rowVersion: unit.rowVersion,
        });
        onSaved('edit');
      } else {
        await UnitService.create(organizationId, values);
        onSaved('create');
      }
    } catch (error) {
      setSubmitError(
        error instanceof ApiError && error.details.length > 0
          ? error.details
          : [(error as Error).message],
      );
      setIsSubmitting(false);
    }
  };

  // Garante que o fuso atual apareça mesmo que não esteja na lista do BR
  const timezoneOptions =
    values.unitTimezone && !BR_TIMEZONES.some((tz) => tz.name === values.unitTimezone)
      ? [{ name: values.unitTimezone, label: values.unitTimezone }, ...BR_TIMEZONES]
      : BR_TIMEZONES;

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: { component: 'form', onSubmit: handleSubmit, noValidate: true } as object,
      }}
    >
      <DialogTitle>
        {isEdit
          ? `Editar unidade${unit?.unitCode ? ` (${unit.unitCode})` : ''}`
          : 'Nova unidade'}
      </DialogTitle>
      <DialogContent>
        {submitError.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError.map((message) => (
              <div key={message}>{message}</div>
            ))}
          </Alert>
        )}
        <Grid container spacing={2} sx={{ pt: 1 }}>
          <Grid size={12}>
            <TextField
              value={values.unitName}
              onChange={handleTextChange('unitName')}
              label="Nome da unidade"
              error={!!errors.unitName}
              helperText={errors.unitName ?? ' '}
              fullWidth
              autoFocus
            />
          </Grid>
          <Grid size={12}>
            <TextField
              value={values.unitAddress}
              onChange={handleTextChange('unitAddress')}
              label="Endereço"
              error={!!errors.unitAddress}
              helperText={errors.unitAddress ?? ' '}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 8 }}>
            <TextField
              value={values.unitMunicipality}
              onChange={handleTextChange('unitMunicipality')}
              label="Município"
              error={!!errors.unitMunicipality}
              helperText={errors.unitMunicipality ?? ' '}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              value={values.unitUF}
              onChange={handleTextChange('unitUF')}
              label="UF"
              error={!!errors.unitUF}
              helperText={errors.unitUF ?? ' '}
              fullWidth
            />
          </Grid>
          <Grid size={12}>
            <FormControl error={!!errors.unitTimezone} fullWidth>
              <InputLabel id="unit-timezone-label">Fuso horário</InputLabel>
              <Select
                value={values.unitTimezone}
                onChange={handleTimezoneChange}
                labelId="unit-timezone-label"
                label="Fuso horário"
                fullWidth
              >
                {timezoneOptions.map((tz) => (
                  <MenuItem key={tz.name} value={tz.name}>
                    {tz.label}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errors.unitTimezone ?? ' '}</FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained" loading={isSubmitting}>
          {isEdit ? 'Salvar' : 'Cadastrar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
