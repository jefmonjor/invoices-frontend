import { useState, useEffect } from 'react';
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
  InputLabel,
  Snackbar,
  Alert
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '@/hooks/useDebounce';
import { useInvoices, useDeleteInvoice, useGeneratePDF } from '../hooks/useInvoices';
import { InvoiceTable } from '../components/InvoiceTable';
import { QuarterSelector } from '../components/QuarterSelector';
import { TableSkeleton } from '@/components/common/Skeletons';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import VerifactuDashboard from '../../dashboard/components/VerifactuDashboard';
import { invoicesApi } from '@/api/invoices.api';
import type { Invoice } from '@/types/invoice.types';

export const InvoicesListPage: React.FC = () => {
  const { t } = useTranslation(['invoices', 'common']);
  const navigate = useNavigate();

  // State - Pagination and filters
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; invoice: Invoice | null }>({
    open: false,
    invoice: null
  });

  // State - Quarter selection
  const currentYear = new Date().getFullYear();
  const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedQuarter, setSelectedQuarter] = useState(currentQuarter);
  const [isDownloading, setIsDownloading] = useState(false);

  // State - Snackbar notifications
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Debounce search term to avoid too many API calls
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, statusFilter]);

  // Queries & Mutations - Server-side pagination
  const { data: invoicesData, isLoading } = useInvoices({
    page,
    size,
    search: debouncedSearch || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const invoices = invoicesData?.invoices || [];
  const totalCount = invoicesData?.totalCount || 0;
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

  // Quarter download handlers
  const handleDownloadQuarter = async (year: number, quarter: number) => {
    setIsDownloading(true);
    try {
      await invoicesApi.downloadQuarter(year, quarter);
      setSnackbar({
        open: true,
        message: t('invoices:messages.downloadSuccess', `ZIP del T${quarter} ${year} descargado correctamente`),
        severity: 'success'
      });
    } catch (error) {
      console.error('Error downloading quarter:', error);
      setSnackbar({
        open: true,
        message: t('invoices:messages.downloadError', 'Error al descargar el archivo'),
        severity: 'error'
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadAll = async (year: number) => {
    setIsDownloading(true);
    try {
      await invoicesApi.downloadAll(year);
      setSnackbar({
        open: true,
        message: t('invoices:messages.downloadSuccess', `ZIP de ${year} descargado correctamente`),
        severity: 'success'
      });
    } catch (error) {
      console.error('Error downloading all:', error);
      setSnackbar({
        open: true,
        message: t('invoices:messages.downloadError', 'Error al descargar el archivo'),
        severity: 'error'
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleExportExcel = async (year: number, quarter?: number) => {
    setIsDownloading(true);
    try {
      await invoicesApi.exportToExcel(year, quarter);
      setSnackbar({
        open: true,
        message: t('invoices:messages.exportSuccess', 'Excel exportado correctamente'),
        severity: 'success'
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      setSnackbar({
        open: true,
        message: t('invoices:messages.exportError', 'Error al exportar a Excel'),
        severity: 'error'
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Check if there are any filters active
  const hasFilters = searchTerm !== '' || statusFilter !== 'all';
  const isEmpty = !isLoading && totalCount === 0;

  return (
    <Box sx={{ p: 3 }}>
      {totalCount > 0 && !isLoading && (
        <Box mb={4}>
          <VerifactuDashboard />
        </Box>
      )}

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

      {/* Quarter Selector - Show only when we have data or finished loading */}
      {!isLoading && !isEmpty && (
        <QuarterSelector
          selectedYear={selectedYear}
          selectedQuarter={selectedQuarter}
          onYearChange={setSelectedYear}
          onQuarterChange={setSelectedQuarter}
          onDownloadQuarter={handleDownloadQuarter}
          onDownloadAll={handleDownloadAll}
          onExportExcel={handleExportExcel}
          isDownloading={isDownloading}
        />
      )}

      {/* Filters - Only show if there are invoices or filters are active */}
      {(!isEmpty || hasFilters) && (
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
      )}

      {/* Table */}
      {isLoading ? (
        <Card>
          <TableSkeleton rows={size} columns={7} />
        </Card>
      ) : isEmpty ? (
        <Paper>
          <EmptyState
            title={t('invoices:messages.emptyTitle', 'No hay facturas')}
            message={
              hasFilters
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
            invoices={invoices}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onDownloadPDF={handleDownloadPDF}
            canEdit={true}
            canDelete={true}
          />

          {/* Pagination - Server-side */}
          <TablePagination
            component="div"
            count={totalCount}
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

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InvoicesListPage;
