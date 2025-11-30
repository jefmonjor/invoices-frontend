import { Grid, Box, Typography } from '@mui/material';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import ReceiptRoundedIcon from '@mui/icons-material/ReceiptRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import type { PlatformAdminDashboardDTO } from '@/api/dashboard.api';
import { KPICard } from './KPICard';
import { AlertsList } from './AlertsList';
import { MiniChart } from './MiniChart';

interface Props {
    data: PlatformAdminDashboardDTO;
}

export const PlatformAdminDashboard = ({ data }: Props) => {
    // Transform monthlyGrowthData for chart
    const growthChartData = Object.entries(data.monthlyGrowthData || {}).map(([month, count]) => ({
        name: month,
        value: count
    }));

    return (
        <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                Panel de Administración de Plataforma
            </Typography>

            <Grid container spacing={3}>
                {/* KPIs */}
                <Grid item xs={12} md={4}>
                    <KPICard
                        title="Empresas Activas"
                        value={data.activeCompaniesCount}
                        icon={<BusinessRoundedIcon />}
                        color="primary"
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <KPICard
                        title="Facturas Diarias"
                        value={data.dailyInvoicesCount}
                        icon={<ReceiptRoundedIcon />}
                        color="info"
                        trend={5} // Mock trend
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <KPICard
                        title="Tasa Adopción Veri*Factu"
                        value={`${(data.verifactuAdoptionRate * 100).toFixed(1)}%`}
                        icon={<VerifiedUserRoundedIcon />}
                        color="success"
                    />
                </Grid>

                {/* Growth Chart */}
                <Grid item xs={12} md={8}>
                    <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Crecimiento Mensual
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            <MiniChart data={growthChartData} color="#4F46E5" />
                        </Box>
                    </Box>
                </Grid>

                {/* Alerts */}
                <Grid item xs={12} md={4}>
                    <AlertsList alerts={data.inactiveCompaniesAlerts} title="Empresas Inactivas (>30 días)" />
                </Grid>
            </Grid>
        </Box>
    );
};
