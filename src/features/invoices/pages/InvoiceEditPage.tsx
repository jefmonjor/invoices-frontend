import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import { InvoiceWizard } from '../components/wizard/InvoiceWizard';
import { useInvoice } from '../hooks/useInvoices';
import type { CreateInvoiceRequest } from '@/types/invoice.types';
import { useTranslation } from 'react-i18next';

export const InvoiceEditPage: React.FC = () => {
  const { t } = useTranslation(['invoices', 'common']);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const invoiceId = parseInt(id || '0', 10);

  const { data: invoice, isLoading, error } = useInvoice(invoiceId);

  const handleSuccess = (invoiceId: number) => {
    navigate(`/invoices/${invoiceId}`);
  };

  const handleCancel = () => {
    navigate(`/invoices/${invoiceId}`);
  };

  if (isLoading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Editar Factura
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error || !invoice) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Editar Factura
        </Typography>
        <Alert severity="error">
          Error al cargar la factura: {error?.message || 'Factura no encontrada'}
        </Alert>
      </Box>
    );
  }

  // Transform invoice to form data
  // Nota: Invoice no contiene los porcentajes, solo los totales calculados
  // Usamos 0 como valor por defecto ya que no podemos calcular el porcentaje exacto
  const initialData: Partial<CreateInvoiceRequest> = {
    companyId: invoice.companyId,
    clientId: invoice.clientId,
    invoiceNumber: invoice.invoiceNumber,
    irpfPercentage: 0, // Valor por defecto, el usuario debe especificarlo
    rePercentage: 0, // Valor por defecto, el usuario debe especificarlo
    notes: invoice.notes,
    items: invoice.items,
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {t('invoices:edit')} : {invoice.invoiceNumber}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('invoices:wizard.subtitle', 'Modifica los datos de la factura utilizando el asistente')}
      </Typography>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <InvoiceWizard
            mode="edit"
            invoiceId={invoiceId}
            initialData={initialData}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default InvoiceEditPage;
