import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Skeleton, Alert } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TimerIcon from '@mui/icons-material/Timer';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface MetricCardProps {
    title: string;
    value?: string | number;
    icon: React.ReactNode;
    color: 'success' | 'warning' | 'info' | 'default';
    isLoading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color, isLoading = false }) => {
    const colors = {
        success: '#2e7d32',
        warning: '#ed6c02',
        info: '#0288d1',
        default: '#757575'
    };

    return (
        <Card sx={{ height: '100%', opacity: isLoading ? 0.7 : 1 }}>
            <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography color="textSecondary" variant="subtitle2">
                        {title}
                    </Typography>
                    <Box sx={{ color: colors[color] }}>
                        {icon}
                    </Box>
                </Box>
                {isLoading ? (
                    <Skeleton variant="text" width="60%" height={40} />
                ) : (
                    <Typography variant="h4" component="div" fontWeight="bold" color="text.disabled">
                        {value ?? '--'}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};

/**
 * VeriFactu Dashboard - Muestra métricas de verificación
 * NOTA: Las métricas reales requieren implementar endpoint en backend
 * Por ahora muestra placeholders indicando que no hay datos disponibles
 */
const VerifactuDashboard: React.FC = () => {
    // TODO: Implementar useQuery para obtener métricas reales del backend
    // const { data: metrics, isLoading } = useVerifactuMetrics();
    const isLoading = false; // Sin API todavía
    const hasData = false;   // Sin datos reales todavía

    return (
        <Box mb={4}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Typography variant="h6">
                    Estado VERI*FACTU
                </Typography>
                {!hasData && (
                    <Alert
                        severity="info"
                        icon={<InfoOutlinedIcon fontSize="small" />}
                        sx={{ py: 0, ml: 2 }}
                    >
                        Métricas disponibles próximamente
                    </Alert>
                )}
            </Box>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        title="Facturas Verificadas Hoy"
                        value={hasData ? undefined : '--'}
                        icon={<CheckCircleIcon fontSize="large" />}
                        color="success"
                        isLoading={isLoading}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        title="Pendientes"
                        value={hasData ? undefined : '--'}
                        icon={<ScheduleIcon fontSize="large" />}
                        color="warning"
                        isLoading={isLoading}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        title="Tasa de Éxito"
                        value={hasData ? undefined : '--%'}
                        icon={<TrendingUpIcon fontSize="large" />}
                        color="info"
                        isLoading={isLoading}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        title="Tiempo Medio"
                        value={hasData ? undefined : '--s'}
                        icon={<TimerIcon fontSize="large" />}
                        color="default"
                        isLoading={isLoading}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default VerifactuDashboard;
