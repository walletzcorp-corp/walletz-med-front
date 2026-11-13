import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {
  DataGrid,
  GridActionsCellItem,
  type GridColDef,
  gridClasses,
} from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDialogs } from '../../hooks/useDialogs/useDialogs';
import useNotifications from '../../hooks/useNotifications/useNotifications';
import type { Unit, UnitStatus } from '../../models/unit';
import { UnitService } from '../../services/UnitService';
import { ApiError } from '../../services/ApiError';
import UnitEditDialog from './UnitEditDialog';

const STATUS_CONFIG: Record<
  UnitStatus,
  { label: string; color: 'default' | 'success' | 'warning' | 'error' }
> = {
  RASCUNHO: { label: 'Rascunho', color: 'warning' },
  ATIVA: { label: 'Ativa', color: 'success' },
  INATIVA: { label: 'Inativa', color: 'default' },
  BLOQUEADA: { label: 'Bloqueada', color: 'error' },
};

function errorMessage(error: unknown) {
  if (error instanceof ApiError && error.details.length > 0) {
    return error.details.join(', ');
  }
  return (error as Error).message;
}

interface Props {
  organizationId: string;
}

export default function UnitGrid({ organizationId }: Props) {
  const dialogs = useDialogs();
  const notifications = useNotifications();

  const [rows, setRows] = React.useState<Unit[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  // Estado do modal: fechado, inclusão (unit = null) ou edição (unit preenchida).
  // `key` muda a cada abertura para reiniciar o formulário.
  const [dialog, setDialog] = React.useState<{
    open: boolean;
    unit: Unit | null;
    key: number;
  }>({ open: false, unit: null, key: 0 });

  const openDialog = React.useCallback((unit: Unit | null) => {
    setDialog((prev) => ({ open: true, unit, key: prev.key + 1 }));
  }, []);

  const closeDialog = React.useCallback(() => {
    setDialog((prev) => ({ ...prev, open: false }));
  }, []);

  const loadData = React.useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      setRows(await UnitService.getByOrganizationId(organizationId));
    } catch (loadError) {
      setError(errorMessage(loadError));
    }
    setIsLoading(false);
  }, [organizationId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = React.useCallback(() => {
    if (!isLoading) loadData();
  }, [isLoading, loadData]);

  const handleRowEdit = React.useCallback(
    (unit: Unit) => () => openDialog(unit),
    [openDialog],
  );

  const handleCreateClick = React.useCallback(() => openDialog(null), [openDialog]);

  // A API não possui DELETE de unidade: a remoção bloqueia a unidade.
  const handleRowDelete = React.useCallback(
    (unit: Unit) => async () => {
      const reason = await dialogs.prompt(
        `Informe o motivo para remover (bloquear) a unidade "${unit.unitName}".`,
        {
          title: 'Remover unidade?',
          okText: 'Remover',
          cancelText: 'Cancelar',
        },
      );

      if (reason === null) return;
      if (!reason.trim()) {
        notifications.show('O motivo é obrigatório para remover a unidade.', {
          severity: 'warning',
          autoHideDuration: 3000,
        });
        return;
      }

      setIsLoading(true);
      try {
        await UnitService.block(organizationId, unit.id, reason.trim());
        notifications.show('Unidade removida (bloqueada) com sucesso.', {
          severity: 'success',
          autoHideDuration: 3000,
        });
        await loadData();
      } catch (deleteError) {
        notifications.show(`Falha ao remover unidade. ${errorMessage(deleteError)}`, {
          severity: 'error',
          autoHideDuration: 5000,
        });
        setIsLoading(false);
      }
    },
    [dialogs, notifications, organizationId, loadData],
  );

  const handleSaved = React.useCallback(
    (mode: 'create' | 'edit') => {
      closeDialog();
      notifications.show(
        mode === 'create'
          ? 'Unidade cadastrada com sucesso.'
          : 'Unidade atualizada com sucesso.',
        { severity: 'success', autoHideDuration: 3000 },
      );
      loadData();
    },
    [closeDialog, notifications, loadData],
  );

  const columns = React.useMemo<GridColDef<Unit>[]>(
    () => [
      { field: 'unitCode', headerName: 'Código', width: 110 },
      { field: 'unitName', headerName: 'Nome', flex: 1, minWidth: 180 },
      { field: 'unitMunicipality', headerName: 'Município', width: 160 },
      { field: 'unitUF', headerName: 'UF', width: 70 },
      { field: 'unitTimezone', headerName: 'Fuso horário', width: 170 },
      {
        field: 'status',
        headerName: 'Status',
        width: 120,
        renderCell: ({ value }) => {
          const config = STATUS_CONFIG[value as UnitStatus];
          return (
            <Chip
              size="small"
              variant="outlined"
              label={config?.label ?? value}
              color={config?.color ?? 'default'}
            />
          );
        },
      },
      {
        field: 'actions',
        type: 'actions',
        flex: 1,
        minWidth: 100,
        align: 'right',
        getActions: ({ row }) => [
          <GridActionsCellItem
            key="edit-item"
            icon={<EditIcon />}
            label="Editar"
            onClick={handleRowEdit(row)}
          />,
          <GridActionsCellItem
            key="delete-item"
            icon={<DeleteIcon />}
            label="Remover"
            onClick={handleRowDelete(row)}
            disabled={row.status === 'BLOQUEADA' || row.status === 'INATIVA'}
          />,
        ],
      },
    ],
    [handleRowEdit, handleRowDelete],
  );

  return (
    <Stack spacing={2}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5">Unidades</Typography>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Tooltip title="Recarregar" placement="left" enterDelay={1000}>
            <div>
              <IconButton size="small" aria-label="recarregar" onClick={handleRefresh}>
                <RefreshIcon />
              </IconButton>
            </div>
          </Tooltip>
          <Button variant="contained" onClick={handleCreateClick} startIcon={<AddIcon />}>
            Nova unidade
          </Button>
        </Stack>
      </Stack>

      <Box sx={{ width: '100%' }}>
        {error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(row) => row.id}
            loading={isLoading}
            autoHeight
            disableRowSelectionOnClick
            pageSizeOptions={[5, 10, 25]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            localeText={{ noRowsLabel: 'Nenhuma unidade cadastrada.' }}
            sx={{
              [`& .${gridClasses.columnHeader}, & .${gridClasses.cell}`]: {
                outline: 'transparent',
              },
              [`& .${gridClasses.columnHeader}:focus-within, & .${gridClasses.cell}:focus-within`]:
                { outline: 'none' },
            }}
            slotProps={{
              loadingOverlay: {
                variant: 'circular-progress',
                noRowsVariant: 'circular-progress',
              },
              baseIconButton: { size: 'small' },
            }}
          />
        )}
      </Box>

      <UnitEditDialog
        key={dialog.key}
        open={dialog.open}
        organizationId={organizationId}
        unit={dialog.unit}
        onClose={closeDialog}
        onSaved={handleSaved}
      />
    </Stack>
  );
}
