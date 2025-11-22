import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TimerIcon from '@mui/icons-material/Timer';

// Mock data for now - in real app would come from API
const mockMetrics = {
    todayVerified: 12,
    pending: 3,
    successRate: 94,
    avgTime: 2.5
};

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: 'success' | 'warning' | 'info' | 'default';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color }) => {
    const colors = {
        success: '#2e7d32',
        warning: '#ed6c02',
        info: '#0288d1',
        default: '#757575'
    };

    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography color="textSecondary" variant="subtitle2">
                        {title}
                    </Typography>
                    <Box sx={{ color: colors[color] }}>
                        {icon}
                    </Box>
                </Box>
                <Typography variant="h4" component="div" fontWeight="bold">
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );
};

const VerifactuDashboard: React.FC = () => {
    // In a real implementation, useQuery here
    const metrics = mockMetrics;

    return (
        <Box mb={4}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                Estado VERI*FACTU
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        title="Facturas Verificadas Hoy"
                        value={metrics.todayVerified}
                        icon={<CheckCircleIcon fontSize="large" />}
                        color="success"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        title="Pendientes"
                        value={metrics.pending}
                        icon={<ScheduleIcon fontSize="large" />}
                        color="warning"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        title="Tasa de Éxito"
                        value={`${metrics.successRate}%`}
                        icon={<TrendingUpIcon fontSize="large" />}
                        color="info"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        title="Tiempo Medio"
                        value={`${metrics.avgTime}s`}
                        icon={<TimerIcon fontSize="large" />}
                        color="default"
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default VerifactuDashboard;
