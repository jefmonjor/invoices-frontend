import { lazy, Suspense } from 'react';
import { Box, Typography, Skeleton, Alert, CircularProgress } from '@mui/material';
import { useAuthStore } from '@/store/authStore';
import { useDashboard } from '../hooks/useDashboard';

// Lazy load dashboard components to reduce initial bundle
// Charts (recharts) are only loaded when dashboard is visited
const PlatformAdminDashboard = lazy(() =>
  import('../components/PlatformAdminDashboard').then(m => ({ default: m.PlatformAdminDashboard }))
);
const CompanyAdminDashboard = lazy(() =>
  import('../components/CompanyAdminDashboard').then(m => ({ default: m.CompanyAdminDashboard }))
);
const CompanyUserDashboard = lazy(() =>
  import('../components/CompanyUserDashboard').then(m => ({ default: m.CompanyUserDashboard }))
);

const DashboardLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
    <CircularProgress />
  </Box>
);

export const DashboardPage = () => {
  const { user } = useAuthStore();
  const { data, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width={300} height={60} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={200} sx={{ mb: 3, borderRadius: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">No se pudieron cargar los datos del dashboard.</Alert>
      </Box>
    );
  }

  if (!data) return null;

  return (
    <Box sx={{ p: 3 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Hola, {user?.firstName} 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Aquí tienes un resumen de tu actividad.
        </Typography>
      </Box>

      {/* Role-based Dashboard with Suspense */}
      <Suspense fallback={<DashboardLoader />}>
        {data.role === 'PLATFORM_ADMIN' && <PlatformAdminDashboard data={data} />}
        {data.role === 'COMPANY_ADMIN' && <CompanyAdminDashboard data={data} />}
        {data.role === 'COMPANY_USER' && <CompanyUserDashboard data={data} />}
      </Suspense>
    </Box>
  );
};

export default DashboardPage;

