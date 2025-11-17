import { lazy, Suspense, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme, CssBaseline, CircularProgress, Box } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { PrivateRoute } from './routes/PrivateRoute';
import { MainLayout } from './components/layout/MainLayout';
import { useThemeStore } from './store/themeStore';

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('./features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('./features/auth/pages/RegisterPage'));
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

function App() {
  const themeMode = useThemeStore((state) => state.mode);

  // Create MUI theme dynamically based on mode
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: themeMode,
          primary: {
            main: '#1976d2',
          },
          secondary: {
            main: '#dc004e',
          },
          ...(themeMode === 'dark' && {
            background: {
              default: '#121212',
              paper: '#1e1e1e',
            },
          }),
        },
        transitions: {
          duration: {
            shortest: 150,
            shorter: 200,
            short: 250,
            standard: 300,
            complex: 375,
            enteringScreen: 225,
            leavingScreen: 195,
          },
        },
        components: {
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
                },
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                transition: 'all 0.2s ease-in-out',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                transition: 'box-shadow 0.2s ease-in-out',
              },
            },
          },
          MuiTableRow: {
            styleOverrides: {
              root: {
                transition: 'background-color 0.2s ease-in-out',
              },
            },
          },
        },
      }),
    [themeMode]
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
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
          </Suspense>
        </BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
