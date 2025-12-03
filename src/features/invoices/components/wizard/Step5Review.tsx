import { Box, Button, Typography, Stack, Grid, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Card, CardContent, CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { companiesApi } from '@/api/companies.api';
import { clientsApi } from '@/api/clients.api';
import type { CreateInvoiceRequest } from '@/types/invoice.types';
import { useTranslation } from 'react-i18next';

interface Step5ReviewProps {
  formData: CreateInvoiceRequest;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  mode?: 'create' | 'edit';
}

export const Step5Review: React.FC<Step5ReviewProps> = ({
  formData,
  onSubmit,
  onBack,
  isSubmitting,
  mode = 'create',
}) => {
  const { t } = useTranslation(['invoices', 'common']);

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: () => companiesApi.list(),
  });

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsApi.list(),
  });

  const company = companies?.find((c) => c.id === formData.companyId);
  const client = clients?.find((c) => c.id === formData.clientId);

  // Calculate totals
  const calculateItemSubtotal = (item: typeof formData.items[0]) => {
    return item.quantity * item.unitPrice;
  };

  const calculateItemDiscount = (item: typeof formData.items[0]) => {
    const subtotal = calculateItemSubtotal(item);
    return subtotal * ((item.discountPercentage || 0) / 100);
  };

  const calculateItemVAT = (item: typeof formData.items[0]) => {
    const subtotal = calculateItemSubtotal(item);
    const discount = calculateItemDiscount(item);
    const subtotalAfterDiscount = subtotal - discount;
    return subtotalAfterDiscount * (item.taxRate / 100);
  };

  const calculateItemTotal = (item: typeof formData.items[0]) => {
    const subtotal = calculateItemSubtotal(item);
    const discount = calculateItemDiscount(item);
    const subtotalAfterDiscount = subtotal - discount;
    const vat = calculateItemVAT(item);
    return subtotalAfterDiscount + vat;
  };

  const subtotal = formData.items.reduce((sum, item) => sum + calculateItemSubtotal(item), 0);
  const totalDiscount = formData.items.reduce((sum, item) => sum + calculateItemDiscount(item), 0);
  const subtotalAfterDiscount = subtotal - totalDiscount;
  const totalVAT = formData.items.reduce((sum, item) => sum + calculateItemVAT(item), 0);
  const totalIRPF = subtotalAfterDiscount * ((formData.irpfPercentage || 0) / 100);
  const totalRE = subtotalAfterDiscount * ((formData.rePercentage || 0) / 100);
  const totalAmount = subtotalAfterDiscount + totalVAT - totalIRPF + totalRE;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('invoices:wizard.step5.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('invoices:wizard.step5.subtitle', { action: mode === 'edit' ? t('common:actions.update').toLowerCase() : t('common:actions.create').toLowerCase() })}
      </Typography>

      <Grid container spacing={3}>
        {/* Invoice Data */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                {t('invoices:wizard.step5.invoiceData')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    {t('invoices:wizard.step5.number')}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {formData.invoiceNumber}
                  </Typography>
                </Grid>
                {formData.settlementNumber && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      {t('invoices:wizard.step5.settlement')}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {formData.settlementNumber}
                    </Typography>
                  </Grid>
                )}
                {(formData.irpfPercentage || 0) > 0 && (
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      {t('invoices:wizard.step5.irpf')}
                    </Typography>
                    <Typography variant="body2">{formData.irpfPercentage}%</Typography>
                  </Grid>
                )}
                {(formData.rePercentage || 0) > 0 && (
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      {t('invoices:wizard.step5.re')}
                    </Typography>
                    <Typography variant="body2">{formData.rePercentage}%</Typography>
                  </Grid>
                )}
                {formData.notes && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      {t('invoices:wizard.step5.notes')}
                    </Typography>
                    <Typography variant="body2">{formData.notes}</Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Company */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                {t('invoices:wizard.step5.company')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {company ? (
                <>
                  <Typography variant="body2" fontWeight="bold">
                    {company.businessName}
                  </Typography>
                  <Typography variant="body2">CIF: {company.taxId}</Typography>
                  <Typography variant="body2">{company.address}</Typography>
                  <Typography variant="body2">{company.email}</Typography>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {t('invoices:wizard.step5.loading')}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Client */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                {t('invoices:wizard.step5.client')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {client ? (
                <>
                  <Typography variant="body2" fontWeight="bold">
                    {client.businessName}
                  </Typography>
                  <Typography variant="body2">CIF: {client.taxId}</Typography>
                  <Typography variant="body2">{client.address}</Typography>
                  <Typography variant="body2">{client.email}</Typography>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {t('invoices:wizard.step5.loading')}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Totals */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                {t('invoices:wizard.step5.totals')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>{t('invoices:wizard.step5.subtotal')}</Typography>
                <Typography>€{subtotal.toFixed(2)}</Typography>
              </Box>
              {totalDiscount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>{t('invoices:wizard.step5.discount')}</Typography>
                  <Typography color="error">-€{totalDiscount.toFixed(2)}</Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>{t('invoices:wizard.step5.vat')}</Typography>
                <Typography>€{totalVAT.toFixed(2)}</Typography>
              </Box>
              {totalIRPF > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>{t('invoices:wizard.step5.irpf')}</Typography>
                  <Typography color="error">-€{totalIRPF.toFixed(2)}</Typography>
                </Box>
              )}
              {totalRE > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>{t('invoices:wizard.step5.re')}</Typography>
                  <Typography>€{totalRE.toFixed(2)}</Typography>
                </Box>
              )}
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">{t('invoices:wizard.step5.total')}</Typography>
                <Typography variant="h6" color="primary">
                  €{totalAmount.toFixed(2)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Items */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            {t('invoices:wizard.step5.items')} ({formData.items.length})
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('invoices:wizard.step4.table.description')}</TableCell>
                  <TableCell align="right">{t('invoices:wizard.step4.table.quantity')}</TableCell>
                  <TableCell align="right">{t('invoices:wizard.step4.table.unitPrice')}</TableCell>
                  <TableCell align="right">{t('invoices:wizard.step4.table.vat')}</TableCell>
                  <TableCell align="right">{t('invoices:wizard.step4.table.discount')}</TableCell>
                  <TableCell align="right">{t('invoices:wizard.step4.table.total')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">€{item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell align="right">{item.taxRate}%</TableCell>
                    <TableCell align="right">{item.discountPercentage}%</TableCell>
                    <TableCell align="right">
                      <strong>€{calculateItemTotal(item).toFixed(2)}</strong>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
        <Button variant="outlined" onClick={onBack} disabled={isSubmitting}>
          {t('common:actions.back')}
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting
            ? (mode === 'edit' ? t('invoices:wizard.step5.actions.updating') : t('invoices:wizard.step5.actions.creating'))
            : (mode === 'edit' ? t('invoices:wizard.step5.actions.update') : t('invoices:wizard.step5.actions.create'))
          }
        </Button>
      </Stack>
    </Box>
  );
};
