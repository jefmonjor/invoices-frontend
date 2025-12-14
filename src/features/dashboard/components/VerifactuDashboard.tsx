import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useQuery } from '@tanstack/react-query';
import { invoicesApi, type InvoiceListResponse } from '@/api/invoices.api';
import { useCompanyContext } from '@/contexts/useCompanyContext';
import type { Invoice } from '@/types/invoice.types';

interface MetricCardProps {
    title: string;
    value?: string | number;
    icon: React.ReactNode;
    color: 'success' | 'warning' | 'info' | 'error' | 'default';
    isLoading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color, isLoading = false }) => {
    const colors = {
        success: '#2e7d32',
        warning: '#ed6c02',
        info: '#0288d1',
        error: '#d32f2f',
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
                    <Typography variant="h4" component="div" fontWeight="bold">
                        {value ?? '--'}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};

/**
 * VeriFactu Dashboard - Muestra métricas de verificación calculadas de las facturas
 */
const VerifactuDashboard: React.FC = () => {
    const { currentCompany } = useCompanyContext();

    // Fetch invoices to calculate VeriFactu metrics
    const { data: invoicesData, isLoading } = useQuery<InvoiceListResponse>({
        queryKey: ['invoices', currentCompany?.id, 'verifactu-metrics'],
        queryFn: () => invoicesApi.list(),
        enabled: !!currentCompany?.id,
    });

    // Calculate metrics from invoices
    const metrics = React.useMemo(() => {
        const invoices = invoicesData?.invoices || [];

        if (invoices.length === 0) {
            return {
                verified: 0,
                pending: 0,
                rejected: 0,
                successRate: 0
            };
        }

        const verified = invoices.filter((inv: Invoice) => inv.verifactuStatus === 'ACCEPTED').length;
        const pending = invoices.filter((inv: Invoice) =>
            inv.verifactuStatus === 'PENDING' || inv.verifactuStatus === 'PROCESSING'
        ).length;
        const rejected = invoices.filter((inv: Invoice) => inv.verifactuStatus === 'REJECTED').length;
        const total = verified + rejected;
        const successRate = total > 0 ? Math.round((verified / total) * 100) : 0;

        return { verified, pending, rejected, successRate };
    }, [invoicesData]);

    return (
        <Box mb={4}>
            <Typography variant="h6" gutterBottom>
                Estado VERI*FACTU
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        title="Verificadas"
                        value={metrics.verified}
                        icon={<CheckCircleIcon fontSize="large" />}
                        color="success"
                        isLoading={isLoading}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        title="Pendientes"
                        value={metrics.pending}
                        icon={<ScheduleIcon fontSize="large" />}
                        color="warning"
                        isLoading={isLoading}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        title="Rechazadas"
                        value={metrics.rejected}
                        icon={<ErrorOutlineIcon fontSize="large" />}
                        color="error"
                        isLoading={isLoading}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        title="Tasa de Éxito"
                        value={`${metrics.successRate}%`}
                        icon={<TrendingUpIcon fontSize="large" />}
                        color="info"
                        isLoading={isLoading}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default VerifactuDashboard;
