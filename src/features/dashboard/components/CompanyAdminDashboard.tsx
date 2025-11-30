import { Grid, Box, Typography } from '@mui/material';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import type { CompanyAdminDashboardDTO } from '@/api/dashboard.api';
import { KPICard } from './KPICard';
import { MiniChart } from './MiniChart';
import { formatCurrency } from '@/utils/formatters';

interface Props {
    data: CompanyAdminDashboardDTO;
}

export const CompanyAdminDashboard = ({ data }: Props) => {
    // Transform last30DaysRevenue for chart
    const revenueChartData = Object.entries(data.last30DaysRevenue || {}).map(([date, amount]) => ({
        name: date,
        value: amount
    }));

    return (
        <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                Panel de Administración
            </Typography>

            <Grid container spacing={3}>
                {/* KPIs */}
                <Grid item xs={12} md={6}>
                    <KPICard
                        title="Facturación Pendiente"
                        value={formatCurrency(data.pendingInvoicesTotal)}
                        icon={<AttachMoneyRoundedIcon />}
                        color="warning"
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <KPICard
                        title="Rechazos Veri*Factu"
                        value={data.verifactuRejectedCount}
                        icon={<ErrorOutlineRoundedIcon />}
                        color="error"
                        trend={data.verifactuRejectedCount > 0 ? -10 : 0}
                    />
                </Grid>

                {/* Revenue Chart */}
                <Grid item xs={12}>
                    <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Ingresos Últimos 30 Días
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            <MiniChart data={revenueChartData} color="#10B981" />
                        </Box>
                    </Box>
                </Grid>

                {/* Top Clients Table - Simplified for now */}
                <Grid item xs={12}>
                    <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Top 5 Clientes
                        </Typography>
                        {data.top5Clients?.map((client, index) => (
                            <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #eee' }}>
                                <Typography>{client.clientName}</Typography>
                                <Typography fontWeight="bold">{formatCurrency(client.totalRevenue)}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};
