import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { PrivateRoute } from './routes/PrivateRoute';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './features/auth/pages/LoginPage';
import { RegisterPage } from './features/auth/pages/RegisterPage';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { ProfilePage } from './features/users/pages/ProfilePage';
import { InvoicesListPage } from './features/invoices/pages/InvoicesListPage';
import { InvoiceDetailPage } from './features/invoices/pages/InvoiceDetailPage';
import { InvoiceCreatePage } from './features/invoices/pages/InvoiceCreatePage';
import { InvoiceEditPage } from './features/invoices/pages/InvoiceEditPage';
import { CompaniesListPage } from './features/companies/pages/CompaniesListPage';
import { CompanyCreatePage } from './features/companies/pages/CompanyCreatePage';
import { CompanyEditPage } from './features/companies/pages/CompanyEditPage';
import { ClientsListPage } from './features/clients/pages/ClientsListPage';
import { ClientCreatePage } from './features/clients/pages/ClientCreatePage';
import { ClientEditPage } from './features/clients/pages/ClientEditPage';
import { UsersListPage } from './features/users/pages/UsersListPage';
import { UserCreatePage } from './features/users/pages/UserCreatePage';
import { UserEditPage } from './features/users/pages/UserEditPage';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Create MUI theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Private routes with Layout */}
            <Route element={<PrivateRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />

                {/* Invoices */}
                <Route path="/invoices" element={<InvoicesListPage />} />
                <Route path="/invoices/create" element={<InvoiceCreatePage />} />
                <Route path="/invoices/:id/edit" element={<InvoiceEditPage />} />
                <Route path="/invoices/:id" element={<InvoiceDetailPage />} />

                {/* Companies */}
                <Route path="/companies" element={<CompaniesListPage />} />
                <Route path="/companies/create" element={<CompanyCreatePage />} />
                <Route path="/companies/:id/edit" element={<CompanyEditPage />} />

                {/* Clients */}
                <Route path="/clients" element={<ClientsListPage />} />
                <Route path="/clients/create" element={<ClientCreatePage />} />
                <Route path="/clients/:id/edit" element={<ClientEditPage />} />

                {/* Users (Admin only) */}
                <Route path="/users" element={<UsersListPage />} />
                <Route path="/users/create" element={<UserCreatePage />} />
                <Route path="/users/:id/edit" element={<UserEditPage />} />

                {/* Profile */}
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Route>

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
