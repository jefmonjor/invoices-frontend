import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Stack,
  useTheme,
  Skeleton,
  alpha
} from '@mui/material';

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useAuthStore } from '@/store/authStore';
import { useCompanyContext } from '@/contexts/CompanyContext';
import { dashboardApi } from '@/api/dashboard.api';
import type { DashboardMetrics } from '@/api/dashboard.api';
import { formatCurrency } from '@/utils/formatters';
import { EmptyState } from '@/components/common/EmptyState';

export const DashboardPage = () => {
  const { user } = useAuthStore();
  const { currentCompany } = useCompanyContext();
  const theme = useTheme();

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (currentCompany?.id) {
        setLoading(true);
        try {
          const data = await dashboardApi.getMetrics(currentCompany.id);
          setMetrics(data);
        } catch (error) {
          console.error('Error fetching metrics:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchMetrics();
  }, [currentCompany?.id]);

  return (
    <Box sx={{ p: 2 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Hola, {user?.firstName} 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Aquí tienes un resumen de tu actividad.
        </Typography>
      </Box>

      {/* Charts Section */}
      <Grid container spacing={3}>
        {/* Revenue Chart */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Evolución de Ingresos
              </Typography>
              <Box sx={{ height: 350, mt: 2 }}>
                {loading ? (
                  <Skeleton variant="rectangular" height="100%" sx={{ borderRadius: 2 }} />
                ) : !metrics?.monthlyRevenue || metrics.monthlyRevenue.length === 0 ? (
                  <EmptyState
                    title="No hay datos de ingresos"
                    message="Aún no se han registrado ingresos en este periodo."
                    icon={<Typography variant="h1">📊</Typography>}
                  />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metrics?.monthlyRevenue}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.text.secondary, 0.1)} />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: theme.palette.text.secondary }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: theme.palette.text.secondary }}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          borderRadius: '8px',
                          border: 'none',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke={theme.palette.primary.main}
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Clients */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Top Clientes
              </Typography>
              <Stack spacing={3} sx={{ mt: 3 }}>
                {loading ? (
                  [1, 2, 3].map((i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 2 }}>
                      <Skeleton variant="circular" width={40} height={40} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="text" width="40%" />
                      </Box>
                    </Box>
                  ))
                ) : !metrics?.topClients || metrics.topClients.length === 0 ? (
                  <EmptyState
                    title="Sin clientes top"
                    message="Aún no hay suficientes datos de clientes."
                    icon={<Typography variant="h1">👥</Typography>}
                  />
                ) : (
                  metrics?.topClients.map((client, index) => (
                    <Box
                      key={client.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 1,
                        borderRadius: 2,
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: alpha(theme.palette.secondary.main, 0.1),
                          color: theme.palette.secondary.main,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold'
                        }}
                      >
                        {index + 1}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {client.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatCurrency(client.totalSpent)} facturados
                        </Typography>
                      </Box>
                    </Box>
                  ))
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

    </Box>
  );
};

export default DashboardPage;
