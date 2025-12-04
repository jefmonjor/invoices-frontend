import { Grid, Box, Typography } from '@mui/material';
import EuroRoundedIcon from '@mui/icons-material/EuroRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
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

    const hasClients = data.top5Clients && data.top5Clients.length > 0;

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
                        value={data.pendingInvoicesTotal > 0 ? formatCurrency(data.pendingInvoicesTotal) : '0,00 €'}
                        subtitle={data.pendingInvoicesTotal === 0 ? 'Total de facturas pendientes de cobro' : undefined}
                        icon={<EuroRoundedIcon />}
                        color="warning"
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <KPICard
                        title="Rechazos Veri*Factu"
                        value={data.verifactuRejectedCount}
                        subtitle={data.verifactuRejectedCount === 0 ? 'Facturas rechazadas por la AEAT' : undefined}
                        icon={<ErrorOutlineRoundedIcon />}
                        color={data.verifactuRejectedCount > 0 ? 'error' : 'success'}
                    />
                </Grid>

                {/* Revenue Chart */}
                <Grid item xs={12}>
                    <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Ingresos Últimos 30 Días
                        </Typography>
                        {revenueChartData.length > 0 ? (
                            <Box sx={{ mt: 2 }}>
                                <MiniChart data={revenueChartData} color="#10B981" />
                            </Box>
                        ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 4, color: 'text.secondary' }}>
                                <InfoOutlinedIcon fontSize="small" />
                                <Typography variant="body2">
                                    Aquí aparecerá un gráfico con tus ingresos cuando tengas facturas pagadas.
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Grid>

                {/* Top Clients Table */}
                <Grid item xs={12}>
                    <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Top 5 Clientes
                        </Typography>
                        {hasClients ? (
                            data.top5Clients?.map((client, index) => (
                                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #eee' }}>
                                    <Typography>{client.clientName}</Typography>
                                    <Typography fontWeight="bold">{formatCurrency(client.totalRevenue)}</Typography>
                                </Box>
                            ))
                        ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2, color: 'text.secondary' }}>
                                <InfoOutlinedIcon fontSize="small" />
                                <Typography variant="body2">
                                    Tus clientes con mayor facturación aparecerán aquí.
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};
