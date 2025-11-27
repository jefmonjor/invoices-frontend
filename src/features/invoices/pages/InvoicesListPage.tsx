import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Typography,
  TextField,
  MenuItem,
  TablePagination,
  Paper,
  Stack,
  InputAdornment,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useInvoices, useDeleteInvoice, useGeneratePDF } from '../hooks/useInvoices';
import { InvoiceTable } from '../components/InvoiceTable';
import { TableSkeleton } from '@/components/common/Skeletons';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import VerifactuDashboard from '../../dashboard/components/VerifactuDashboard';
import type { Invoice } from '@/types/invoice.types';

export const InvoicesListPage: React.FC = () => {
  const { t } = useTranslation(['invoices', 'common']);

  const navigate = useNavigate();

  // State
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; invoice: Invoice | null }>({
    open: false,
    invoice: null
  });

  // Queries & Mutations
  const { data: invoices, isLoading } = useInvoices();
  const deleteMutation = useDeleteInvoice();
  const generatePDFMutation = useGeneratePDF();

  // Handlers
  const handleCreateNew = () => navigate('/invoices/create');
  const handleView = (invoice: Invoice) => navigate(`/invoices/${invoice.id}`);
  const handleEdit = (invoice: Invoice) => navigate(`/invoices/${invoice.id}/edit`);

  const handleDeleteClick = (invoice: Invoice) => {
    setDeleteDialog({ open: true, invoice });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.invoice) {
      try {
        await deleteMutation.mutateAsync(deleteDialog.invoice.id);
        setDeleteDialog({ open: false, invoice: null });
      } catch (error) {
        console.error('Error deleting invoice:', error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, invoice: null });
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      await generatePDFMutation.mutateAsync({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filtering & Pagination
  const filteredInvoices = useMemo(() => {
    if (!invoices) return [];

    return invoices.filter((invoice) => {
      const matchesSearch =
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.client?.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        false;

      const matchesStatus = statusFilter === 'all' || invoice.verifactuStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  const paginatedInvoices = useMemo(() => {
    const startIndex = page * size;
    return filteredInvoices.slice(startIndex, startIndex + size);
  }, [filteredInvoices, page, size]);



  return (
    <Box sx={{ p: 3 }}>
      <Box mb={4}>
        <VerifactuDashboard />
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2} mb={3}>
        <Typography variant="h4" component="h1">
          {t('invoices:list.title', 'Facturas')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
        >
          {t('invoices:list.create', 'Nueva Factura')}
        </Button>
      </Stack>

      <Card sx={{ mb: 3, p: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            fullWidth
            placeholder={t('invoices:list.searchPlaceholder', 'Buscar por número o cliente...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            size="small"
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>{t('invoices:list.statusFilter', 'Estado VeriFactu')}</InputLabel>
            <Select
              value={statusFilter}
              label={t('invoices:list.statusFilter', 'Estado VeriFactu')}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">{t('common:filters.all', 'Todos')}</MenuItem>
              <MenuItem value="ACCEPTED">{t('invoices:status.accepted', 'Aceptada')}</MenuItem>
              <MenuItem value="PENDING">{t('invoices:status.pending', 'Pendiente')}</MenuItem>
              <MenuItem value="REJECTED">{t('invoices:status.rejected', 'Rechazada')}</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Card>

      {/* Table */}
      {isLoading ? (
        <Card>
          <TableSkeleton rows={10} columns={7} />
        </Card>
      ) : !filteredInvoices || filteredInvoices.length === 0 ? (
        <Paper>
          <EmptyState
            title={t('invoices:messages.emptyTitle', 'No hay facturas')}
            message={
              searchTerm || statusFilter !== 'all'
                ? t('invoices:messages.emptyMessage', 'No se encontraron facturas con los filtros aplicados.')
                : t('invoices:messages.emptyMessageInit', 'Crea tu primera factura para empezar.')
            }
            actionLabel={t('invoices:messages.createFirst', 'Crear Factura')}
            onAction={handleCreateNew}
          />
        </Paper>
      ) : (
        <>
          <InvoiceTable
            invoices={paginatedInvoices || []}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onDownloadPDF={handleDownloadPDF}
            canEdit={true}
            canDelete={true}
          />

          {/* Pagination (client-side) */}
          <TablePagination
            component="div"
            count={filteredInvoices.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={size}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 20, 50, 100]}
            labelRowsPerPage={t('common:pagination.rowsPerPage', 'Filas por página')}
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} ${t('common:pagination.of', 'de')} ${count}`}
          />
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        title={t('invoices:messages.deleteConfirmTitle', 'Eliminar Factura')}
        message={t('invoices:messages.deleteConfirmMessage', { number: deleteDialog.invoice?.invoiceNumber })}
        confirmLabel={t('common:actions.delete', 'Eliminar')}
        cancelLabel={t('common:actions.cancel', 'Cancelar')}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        severity="error"
      />
    </Box>
  );
};

export default InvoicesListPage;
