//componente pai/principal

import "./App.css";
import CssBaseline from '@mui/material/CssBaseline';
import { createHashRouter, RouterProvider } from 'react-router';
import AppTheme from './theme/AppTheme';
import { dataGridCustomizations, datePickersCustomizations, formInputCustomizations, sidebarCustomizations } from "./theme/customizations";
import NotificationsProvider from "./hooks/useNotifications/NotificationsProvider";
import DialogsProvider from "./hooks/useDialogs/DialogsProvider";
import DashboardLayout from "./components/DashboardLayout";
import OrganizationGrid from "./components/organization/OrganizationGrid";
import OrganizationEdit from "./components/organization/OrganizationEdit";
import OrganizationCreate from "./components/organization/OrganizationCreate";

const router = createHashRouter([
  {
    Component: DashboardLayout,
    children: [
      {
        path: '/organizations',
        Component: OrganizationGrid,
      },
      {
        path: '/organizations/new',
        Component: OrganizationCreate,
      },
      {
        path: '/organizations/:tenantId/edit',
        Component: OrganizationEdit,
      },
      // Fallback: qualquer rota cai na lista de organizações
      {
        path: '*',
        Component: OrganizationGrid,
      },
    ],
  },
]);


const themeComponents = {
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...sidebarCustomizations,
  ...formInputCustomizations,
};

export default function CrudDashboard(props: { disableCustomTheme?: boolean }) {
  return (
    <AppTheme {...props} themeComponents={themeComponents}>
      <CssBaseline enableColorScheme />
      <NotificationsProvider>
        <DialogsProvider>
          <RouterProvider router={router} />
        </DialogsProvider>
      </NotificationsProvider>
    </AppTheme>
  );
}
