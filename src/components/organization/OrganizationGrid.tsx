import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import {
  DataGrid,
  GridActionsCellItem,
  type GridColDef,
  type GridEventListener,
  type GridPaginationModel,
  gridClasses,
} from '@mui/x-data-grid';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import type { Organization } from '../../models/organization';
import { OrganizationService } from '../../services/OrganizationService';
import { ApiError } from '../../services/ApiError';
import PageContainer from '../PageContainer';

const INITIAL_PAGE_SIZE = 10;

const taxProfileLabels: Record<string, string> = {
  SIMPLES_NACIONAL: 'Simples Nacional',
  LUCRO_PRESUMIDO: 'Lucro Presumido',
  LUCRO_REAL: 'Lucro Real',
  MEI: 'MEI',
};

const statusLabels: Record<string, string> = {
  ACTIVE: 'Ativa',
  INACTIVE: 'Inativa',
};

function formatCnpj(value: string) {
  return value?.replace(/^(.{2})(.{3})(.{3})(.{4})(.{2})$/, '$1.$2.$3/$4-$5');
}

export default function OrganizationGrid() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // DataGrid usa page base 0; a API usa page base 1.
  const [paginationModel, setPaginationModel] = React.useState<GridPaginationModel>({
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 0,
    pageSize: searchParams.get('pageSize')
      ? Number(searchParams.get('pageSize'))
      : INITIAL_PAGE_SIZE,
  });

  const [rowsState, setRowsState] = React.useState<{
    rows: Organization[];
    rowCount: number;
  }>({ rows: [], rowCount: 0 });

  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const handlePaginationModelChange = React.useCallback(
    (model: GridPaginationModel) => {
      setPaginationModel(model);

      searchParams.set('page', String(model.page));
      searchParams.set('pageSize', String(model.pageSize));

      navigate(`${pathname}?${searchParams.toString()}`);
    },
    [navigate, pathname, searchParams],
  );

  const loadData = React.useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await OrganizationService.getOrganizationsPaginated(
        paginationModel.page + 1,
        paginationModel.pageSize,
      );

      setRowsState({ rows: result.data, rowCount: result.meta.total });
    } catch (loadError) {
      const message =
        loadError instanceof ApiError && loadError.details.length > 0
          ? `${loadError.message}: ${loadError.details.join(', ')}`
          : (loadError as Error).message;
      setError(message);
    }

    setIsLoading(false);
  }, [paginationModel]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = React.useCallback(() => {
    if (!isLoading) {
      loadData();
    }
  }, [isLoading, loadData]);

  // A edição usa as rotas /tenants/:tenantId/organization da API
  const handleRowEdit = React.useCallback(
    (organization: Organization) => () => {
      navigate(`/organizations/${organization.tenantId}/edit`);
    },
    [navigate],
  );

  const handleRowClick = React.useCallback<GridEventListener<'rowClick'>>(
    ({ row }) => {
      navigate(`/organizations/${row.tenantId}/edit`);
    },
    [navigate],
  );

  const columns = React.useMemo<GridColDef<Organization>[]>(
    () => [
      { field: 'legalName', headerName: 'Razão social', flex: 1, minWidth: 200 },
      { field: 'tradeName', headerName: 'Nome fantasia', flex: 1, minWidth: 180 },
      {
        field: 'cnpjDigits',
        headerName: 'CNPJ',
        width: 180,
        valueFormatter: (value: string) => formatCnpj(value),
      },
      {
        field: 'taxProfile',
        headerName: 'Perfil tributário',
        width: 170,
        valueFormatter: (value: string) => taxProfileLabels[value] ?? value,
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 120,
        renderCell: ({ value }) => (
          <Chip
            size="small"
            label={statusLabels[value] ?? value}
            color={value === 'ACTIVE' ? 'success' : 'default'}
            variant="outlined"
          />
        ),
      },
      {
        field: 'actions',
        type: 'actions',
        width: 80,
        align: 'right',
        getActions: ({ row }) => [
          <GridActionsCellItem
            key="edit-item"
            icon={<EditIcon />}
            label="Editar"
            onClick={handleRowEdit(row)}
          />,
        ],
      },
    ],
    [handleRowEdit],
  );

  const pageTitle = 'Organizações';

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[{ title: pageTitle }]}
      actions={
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Tooltip title="Recarregar" placement="right" enterDelay={1000}>
            <div>
              <IconButton size="small" aria-label="recarregar" onClick={handleRefresh}>
                <RefreshIcon />
              </IconButton>
            </div>
          </Tooltip>
          <Button
            variant="contained"
            onClick={() => navigate('/organizations/new')}
            startIcon={<AddIcon />}
          >
            Nova organização
          </Button>
        </Stack>
      }
    >
      <Box sx={{ flex: 1, width: '100%' }}>
        {error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <DataGrid
            rows={rowsState.rows}
            rowCount={rowsState.rowCount}
            columns={columns}
            getRowId={(row) => row.id}
            pagination
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            pageSizeOptions={[5, INITIAL_PAGE_SIZE, 25, 50, 100]}
            disableColumnFilter
            disableColumnSorting
            disableRowSelectionOnClick
            onRowClick={handleRowClick}
            loading={isLoading}
            localeText={{ noRowsLabel: 'Nenhuma organização cadastrada.' }}
            sx={{
              [`& .${gridClasses.columnHeader}, & .${gridClasses.cell}`]: {
                outline: 'transparent',
              },
              [`& .${gridClasses.columnHeader}:focus-within, & .${gridClasses.cell}:focus-within`]:
                { outline: 'none' },
              [`& .${gridClasses.row}:hover`]: { cursor: 'pointer' },
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
    </PageContainer>
  );
}
