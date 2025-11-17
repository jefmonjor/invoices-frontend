import { Box, Button, Typography, Stack, Grid, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Card, CardContent, CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { companiesApi } from '@/api/companies.api';
import { clientsApi } from '@/api/clients.api';
import { formatDate } from '@/utils/formatters';
import type { CreateInvoiceRequest } from '@/types/invoice.types';

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

  const calculateItemTax = (item: typeof formData.items[0]) => {
    const subtotal = calculateItemSubtotal(item);
    return subtotal * (item.taxRate / 100);
  };

  const calculateItemTotal = (item: typeof formData.items[0]) => {
    return calculateItemSubtotal(item) + calculateItemTax(item);
  };

  const subtotal = formData.items.reduce((sum, item) => sum + calculateItemSubtotal(item), 0);
  const taxAmount = formData.items.reduce((sum, item) => sum + calculateItemTax(item), 0);
  const totalAmount = subtotal + taxAmount;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Paso 5: Revisar y Confirmar
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Revisa todos los datos antes de {mode === 'edit' ? 'actualizar' : 'crear'} la factura
      </Typography>

      <Grid container spacing={3}>
        {/* Invoice Data */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Datos de la Factura
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Número:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {formData.invoiceNumber}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Fecha Emisión:
                  </Typography>
                  <Typography variant="body2">{formatDate(formData.issueDate)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Fecha Vencimiento:
                  </Typography>
                  <Typography variant="body2">{formatDate(formData.dueDate)}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Company */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Empresa Emisora
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {company ? (
                <>
                  <Typography variant="body2" fontWeight="bold">
                    {company.name}
                  </Typography>
                  <Typography variant="body2">CIF: {company.taxId}</Typography>
                  <Typography variant="body2">{company.address}</Typography>
                  <Typography variant="body2">{company.email}</Typography>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Cargando...
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
                Cliente
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {client ? (
                <>
                  <Typography variant="body2" fontWeight="bold">
                    {client.name}
                  </Typography>
                  <Typography variant="body2">CIF: {client.taxId}</Typography>
                  <Typography variant="body2">{client.address}</Typography>
                  <Typography variant="body2">{client.email}</Typography>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Cargando...
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
                Totales
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Subtotal:</Typography>
                <Typography>€{subtotal.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>IVA:</Typography>
                <Typography>€{taxAmount.toFixed(2)}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Total:</Typography>
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
            Items de la Factura ({formData.items.length})
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Descripción</TableCell>
                  <TableCell align="right">Cant.</TableCell>
                  <TableCell align="right">Precio Unit.</TableCell>
                  <TableCell align="right">IVA %</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">€{item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell align="right">{item.taxRate}%</TableCell>
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
          Anterior
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting
            ? (mode === 'edit' ? 'Actualizando...' : 'Creando...')
            : (mode === 'edit' ? 'Actualizar Factura' : 'Crear Factura')
          }
        </Button>
      </Stack>
    </Box>
  );
};
