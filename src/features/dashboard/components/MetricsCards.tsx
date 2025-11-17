import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import {
  Receipt as InvoiceIcon,
  AttachMoney as MoneyIcon,
  HourglassEmpty as PendingIcon,
  CheckCircle as PaidIcon,
} from '@mui/icons-material';
import type { DashboardStats } from '@/types/dashboard.types';
import { formatCurrency } from '@/utils/formatters';

interface MetricsCardsProps {
  stats: DashboardStats;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ stats }) => {
  const metrics = [
    {
      title: 'Total Facturas',
      value: stats.totalInvoices.toString(),
      icon: <InvoiceIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: '#1976d2',
    },
    {
      title: 'Ingresos Totales',
      value: formatCurrency(stats.totalRevenue),
      icon: <MoneyIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      color: '#2e7d32',
    },
    {
      title: 'Facturas Pendientes',
      value: stats.pendingInvoices.toString(),
      icon: <PendingIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      color: '#ed6c02',
    },
    {
      title: 'Facturas Pagadas',
      value: stats.paidInvoices.toString(),
      icon: <PaidIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      color: '#2e7d32',
    },
  ];

  return (
    <Grid container spacing={3}>
      {metrics.map((metric, index) => (
        <Grid xs={12} sm={6} md={3} key={index}>
          <Card
            sx={{
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {metric.title}
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: metric.color }}>
                    {metric.value}
                  </Typography>
                </Box>
                {metric.icon}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
