import { useState, useEffect } from 'react';
import { Box, Grid, Typography, Card, CardContent } from '@mui/material';
import { companyService, type CompanyMetrics } from '@/api/companyService';
import { useAuth } from '@/store/authStore';
import { useUserRole } from '@/hooks/useUserRole';

export const CompanyMetricsCard = () => {
    const { user } = useAuth();
    const { isAdmin } = useUserRole();
    const [metrics, setMetrics] = useState<CompanyMetrics | null>(null);

    useEffect(() => {
        const loadMetrics = async () => {
            try {
                const data = await companyService.getMetrics(user!.currentCompanyId!);
                setMetrics(data);
            } catch (error) {
                console.error('Error loading metrics', error);
            }
        };

        if (user?.currentCompanyId && isAdmin) {
            loadMetrics();
        }
    }, [user, isAdmin]);

    if (!isAdmin || !metrics) return null;

    return (
        <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>Métricas de la Empresa</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Total Facturas
                            </Typography>
                            <Typography variant="h4">{metrics.totalInvoices}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Ingresos Totales
                            </Typography>
                            <Typography variant="h4">
                                €{metrics.totalRevenue?.toLocaleString() || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Clientes
                            </Typography>
                            <Typography variant="h4">{metrics.totalClients}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Usuarios Activos
                            </Typography>
                            <Typography variant="h4">{metrics.activeUsers}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default CompanyMetricsCard;
