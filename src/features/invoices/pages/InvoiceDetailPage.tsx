import { useState, useEffect, useCallback } from 'react';
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
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import { useInvoice, useDeleteInvoice, useGeneratePDF } from '../hooks/useInvoices';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { formatCurrency, formatDate } from '@/utils/formatters';
import VerifactuBadge from '../components/VerifactuBadge';
import { useWebSocketInvoiceStatus } from '../hooks/useWebSocketInvoiceStatus';
import type { InvoiceStatusMessage } from '@/services/websocket.service';
import VerifactuDashboard from '../../dashboard/components/VerifactuDashboard';
import { toastService } from '@/services/toast.service';
import 'react-toastify/dist/ReactToastify.css';

// ... existing imports

const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const invoiceId = parseInt(id || '0', 10);

  const [deleteDialog, setDeleteDialog] = useState(false);
  const [verifactuStatus, setVerifactuStatus] = useState<string | undefined>(undefined);

  const { data: invoice, isLoading, error } = useInvoice(invoiceId);
  const deleteMutation = useDeleteInvoice();
  const generatePDFMutation = useGeneratePDF();

  // Initialize status when invoice loads
  useEffect(() => {
    if (invoice?.verifactuStatus) {
      setVerifactuStatus(invoice.verifactuStatus);
    }
  }, [invoice]);

  // WebSocket handler for status updates
  const handleStatusUpdate = useCallback((message: InvoiceStatusMessage) => {
    console.log('[InvoiceDetail] Received status update:', message);
    if (message.status) {
      const previousStatus = verifactuStatus;
      setVerifactuStatus(message.status);

      // Show toast notification for status changes
      if (previousStatus !== message.status) {
        const normalizedStatus = message.status.toUpperCase();

        switch (normalizedStatus) {
          case 'PENDING':
          case 'PROCESSING':
            toastService.verifactu.processing();
            break;
          case 'ACCEPTED':
            toastService.verifactu.accepted(message.txId);
            break;
          case 'REJECTED':
            toastService.verifactu.rejected(message.errorMessage);
            break;
          case 'FAILED':
            toastService.verifactu.failed(message.errorMessage);
            break;
        }
      }
    }
  }, [verifactuStatus]);

  // WebSocket connection with JWT and automatic reconnection
  useWebSocketInvoiceStatus(
    invoiceId || null,
    handleStatusUpdate
  );


  const handleBack = () => {
    navigate('/invoices');
  };

  const handleEdit = () => {
    navigate(`/invoices/${invoiceId}/edit`);
  };

  const handleGeneratePDF = async () => {
    if (!invoice) return;

    try {
      await generatePDFMutation.mutateAsync({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber
      });
      // Optimistic update
      setVerifactuStatus('processing');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error al generar el PDF');
    }
  };

  const handleDownloadPDF = () => {
    // Download PDF from backend
    window.open(`/api/invoices/${invoiceId}/pdf`, '_blank');
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(invoiceId);
    setDeleteDialog(false);
    navigate('/invoices');
  };

  const canEdit = !!invoice;
  const canDelete = !!invoice;

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
      <Box mb={4}>
        <VerifactuDashboard />
      </Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button startIcon={<BackIcon />} onClick={handleBack}>
            Volver
          </Button>
          <Box>
            <Typography variant="h4" component="span" sx={{ mr: 2 }}>
              Factura {invoice.invoiceNumber}
            </Typography>
            <VerifactuBadge status={verifactuStatus || invoice.verifactuStatus} />
          </Box>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PdfIcon />}
            onClick={handleGeneratePDF}
            disabled={generatePDFMutation.isPending || verifactuStatus === 'processing'}
          >
            {generatePDFMutation.isPending || verifactuStatus?.toUpperCase() === 'PROCESSING' || verifactuStatus?.toUpperCase() === 'PENDING'
              ? 'Generando...'
              : 'Generar PDF'}
          </Button>

          {/* Download button - only enabled for ACCEPTED invoices */}
          <Tooltip
            title={
              verifactuStatus?.toUpperCase() !== 'ACCEPTED'
                ? 'El PDF solo está disponible para facturas verificadas'
                : 'Descargar PDF verificado'
            }
            arrow
          >
            <span>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadPDF}
                disabled={
                  verifactuStatus?.toUpperCase() !== 'ACCEPTED' ||
                  !invoice.pdfServerPath
                }
              >
                Descargar PDF
              </Button>
            </span>
          </Tooltip>

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
                    Fecha
                  </Typography>
                  <Typography variant="body1">{formatDate(invoice.issueDate)}</Typography>
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

                {invoice.documentHash && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Hash del Documento (SHA-256)
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                      {invoice.documentHash}
                    </Typography>
                  </Grid>
                )}
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
                      <TableCell align="right">Unidades</TableCell>
                      <TableCell align="right">Precio</TableCell>
                      <TableCell align="right">IVA %</TableCell>
                      <TableCell align="right">Descuento %</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoice.items.map((item, index) => {
                      const itemTotal = item.units * item.price *
                        (1 + item.vatPercentage / 100) *
                        (1 - (item.discountPercentage || 0) / 100);

                      return (
                        <TableRow key={item.id || index}>
                          <TableCell>{item.description}</TableCell>
                          <TableCell align="right">{item.units}</TableCell>
                          <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                          <TableCell align="right">{item.vatPercentage}%</TableCell>
                          <TableCell align="right">{item.discountPercentage || 0}%</TableCell>
                          <TableCell align="right">
                            <strong>{formatCurrency(itemTotal)}</strong>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
                <Typography>Base Imponible:</Typography>
                <Typography>{formatCurrency(invoice.baseAmount)}</Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>IVA:</Typography>
                <Typography>{formatCurrency(invoice.totalAmount - invoice.baseAmount + invoice.irpfAmount - invoice.reAmount)}</Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>IRPF:</Typography>
                <Typography>{formatCurrency(invoice.irpfAmount)}</Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>RE:</Typography>
                <Typography>{formatCurrency(invoice.reAmount)}</Typography>
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

export default InvoiceDetailPage;
