import { lazy, Suspense, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, CssBaseline, CircularProgress, Box } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { PrivateRoute } from './routes/PrivateRoute';
import { MainLayout } from './components/layout/MainLayout';
import { useThemeStore } from './store/themeStore';
import { useTokenExpiration } from './hooks/useTokenExpiration';
import { CompanyProvider } from './contexts/CompanyContext';

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('./features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('./features/auth/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./features/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./features/auth/pages/ResetPasswordPage'));
const DashboardPage = lazy(() => import('./features/dashboard/pages/DashboardPage'));
const ProfilePage = lazy(() => import('./features/users/pages/ProfilePage'));

// Invoices
const InvoicesListPage = lazy(() => import('./features/invoices/pages/InvoicesListPage'));
const InvoiceDetailPage = lazy(() => import('./features/invoices/pages/InvoiceDetailPage'));
const InvoiceCreatePage = lazy(() => import('./features/invoices/pages/InvoiceCreatePage'));
const InvoiceEditPage = lazy(() => import('./features/invoices/pages/InvoiceEditPage'));

// Companies
const CompaniesListPage = lazy(() => import('./features/companies/pages/CompaniesListPage'));
const CompanyCreatePage = lazy(() => import('./features/companies/pages/CompanyCreatePage'));
const CompanyEditPage = lazy(() => import('./features/companies/pages/CompanyEditPage'));
const CompanyUsersPage = lazy(() => import('./features/companies/pages/CompanyUsersPage'));

// Clients
const ClientsListPage = lazy(() => import('./features/clients/pages/ClientsListPage'));
const ClientCreatePage = lazy(() => import('./features/clients/pages/ClientCreatePage'));
const ClientEditPage = lazy(() => import('./features/clients/pages/ClientEditPage'));

// Users
const UsersListPage = lazy(() => import('./features/users/pages/UsersListPage'));
const UserCreatePage = lazy(() => import('./features/users/pages/UserCreatePage'));
const UserEditPage = lazy(() => import('./features/users/pages/UserEditPage'));

// Loading component
const PageLoader = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
    }}
  >
    <CircularProgress />
  </Box>
);

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

import { getTheme } from './theme/theme';

function App() {
  const themeMode = useThemeStore((state) => state.mode);

  // Monitorear expiración de token
  useTokenExpiration();

  // Monitorear expiración de token
  useTokenExpiration();

  // Create MUI theme dynamically based on mode
  const theme = useMemo(() => getTheme(themeMode), [themeMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <CompanyProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* Private routes with Layout */}
                <Route element={<PrivateRoute />}>
                  <Route element={
                    <CompanyProvider>
                      <MainLayout />
                    </CompanyProvider>
                  }>
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
                    <Route path="/companies/:id/users" element={<CompanyUsersPage />} />

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
            </Suspense>
          </CompanyProvider>
        </BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
