import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import { InvoiceWizard } from '../components/wizard/InvoiceWizard';
import { useInvoice } from '../hooks/useInvoices';
import type { CreateInvoiceRequest } from '@/types/invoice.types';

export const InvoiceEditPage: React.FC = () => {
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

  // Check if invoice can be edited
  if (invoice.status !== 'DRAFT' && invoice.status !== 'PENDING') {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Editar Factura
        </Typography>
        <Alert severity="warning">
          Esta factura no puede ser editada porque su estado es: {invoice.status}. Solo las
          facturas en estado DRAFT o PENDING pueden ser editadas.
        </Alert>
      </Box>
    );
  }

  // Transform invoice to form data
  const initialData: Partial<CreateInvoiceRequest> = {
    companyId: invoice.companyId,
    clientId: invoice.clientId,
    invoiceNumber: invoice.invoiceNumber,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    items: invoice.items,
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Editar Factura: {invoice.invoiceNumber}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Modifica los datos de la factura utilizando el asistente
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
