import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useInvoice, useDeleteInvoice, useGeneratePDF } from '../hooks/useInvoices';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { formatCurrency, formatDate } from '@/utils/formatters';

export const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const invoiceId = parseInt(id || '0', 10);

  const [deleteDialog, setDeleteDialog] = useState(false);

  const { data: invoice, isLoading, error } = useInvoice(invoiceId);
  const deleteMutation = useDeleteInvoice();
  const generatePDFMutation = useGeneratePDF();

  const handleBack = () => {
    navigate('/invoices');
  };

  const handleEdit = () => {
    navigate(`/invoices/${invoiceId}/edit`);
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(invoiceId);
    setDeleteDialog(false);
    navigate('/invoices');
  };

  const handleDownloadPDF = () => {
    if (invoice) {
      generatePDFMutation.mutate({ id: invoice.id, invoiceNumber: invoice.invoiceNumber });
    }
  };

  const canEdit = invoice && (invoice.status === 'DRAFT' || invoice.status === 'PENDING');
  const canDelete = invoice && invoice.status === 'DRAFT';

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !invoice) {
    return (
      <Box>
        <Alert severity="error">Error al cargar la factura. Por favor, intenta de nuevo.</Alert>
        <Button startIcon={<BackIcon />} onClick={handleBack} sx={{ mt: 2 }}>
          Volver a facturas
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button startIcon={<BackIcon />} onClick={handleBack}>
            Volver
          </Button>
          <Typography variant="h4">Factura {invoice.invoiceNumber}</Typography>
          <StatusBadge status={invoice.status} size="medium" />
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadPDF}
            disabled={generatePDFMutation.isPending}
          >
            {generatePDFMutation.isPending ? 'Generando...' : 'Descargar PDF'}
          </Button>

          {canEdit && (
            <Button variant="outlined" startIcon={<EditIcon />} onClick={handleEdit}>
              Editar
            </Button>
          )}

          {canDelete && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteDialog(true)}
            >
              Eliminar
            </Button>
          )}
        </Stack>
      </Box>

      {/* Invoice Details */}
      <Grid container spacing={3}>
        {/* Left Column - Invoice Info */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Información de la Factura
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Número de Factura
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {invoice.invoiceNumber}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Estado
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <StatusBadge status={invoice.status} />
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Fecha de Emisión
                  </Typography>
                  <Typography variant="body1">{formatDate(invoice.issueDate)}</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Fecha de Vencimiento
                  </Typography>
                  <Typography variant="body1">{formatDate(invoice.dueDate)}</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    ID Empresa
                  </Typography>
                  <Typography variant="body1">{invoice.companyId}</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    ID Cliente
                  </Typography>
                  <Typography variant="body1">{invoice.clientId}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Items Table */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Items de la Factura
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Descripción</TableCell>
                      <TableCell align="right">Cantidad</TableCell>
                      <TableCell align="right">Precio Unit.</TableCell>
                      <TableCell align="right">IVA %</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoice.items.map((item, index) => (
                      <TableRow key={item.id || index}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell align="right">{item.taxRate}%</TableCell>
                        <TableCell align="right">
                          <strong>{formatCurrency(item.total || 0)}</strong>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Totals */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Totales
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Subtotal:</Typography>
                <Typography>{formatCurrency(invoice.subtotal)}</Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>IVA:</Typography>
                <Typography>{formatCurrency(invoice.taxAmount)}</Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6" color="primary">
                  {formatCurrency(invoice.totalAmount)}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Metadatos
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Typography variant="caption" color="text.secondary">
                Creada el
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {formatDate(invoice.createdAt, true)}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                Última modificación
              </Typography>
              <Typography variant="body2">
                {formatDate(invoice.updatedAt, true)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog}
        title="Eliminar Factura"
        message={`¿Estás seguro de que deseas eliminar la factura ${invoice.invoiceNumber}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog(false)}
        severity="error"
      />
    </Box>
  );
};
