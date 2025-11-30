import { Grid, Box, Typography } from '@mui/material';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import type { CompanyUserDashboardDTO } from '@/api/dashboard.api';
import { KPICard } from './KPICard';
import { QuickActions } from './QuickActions';
import { formatCurrency } from '@/utils/formatters';

interface Props {
    data: CompanyUserDashboardDTO;
}

export const CompanyUserDashboard = ({ data }: Props) => {
    return (
        <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                Mi Panel
            </Typography>

            <Grid container spacing={3}>
                {/* KPIs */}
                <Grid item xs={12} md={6}>
                    <KPICard
                        title="Mis Facturas (Este Mes)"
                        value={data.myInvoicesThisMonth}
                        icon={<ReceiptLongRoundedIcon />}
                        color="primary"
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <QuickActions />
                </Grid>

                {/* Recent Invoices List */}
                <Grid item xs={12}>
                    <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Mis Últimas Facturas
                        </Typography>
                        {data.myLastInvoices?.length === 0 ? (
                            <Typography color="text.secondary">No tienes facturas recientes.</Typography>
                        ) : (
                            data.myLastInvoices?.map((invoice) => (
                                <Box key={invoice.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, borderBottom: '1px solid #eee' }}>
                                    <Box>
                                        <Typography fontWeight="bold">{invoice.number}</Typography>
                                        <Typography variant="caption" color="text.secondary">{invoice.date}</Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography fontWeight="bold">{formatCurrency(invoice.amount)}</Typography>
                                        <Typography variant="caption" color={invoice.status === 'PAID' ? 'success.main' : 'warning.main'}>
                                            {invoice.status}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))
                        )}
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};
