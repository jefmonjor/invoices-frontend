import { useState } from 'react';
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
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useInvoices, useDeleteInvoice, useGeneratePDF } from '../hooks/useInvoices';
import { InvoiceTable } from '../components/InvoiceTable';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import type { Invoice } from '@/types/invoice.types';

export const InvoicesListPage: React.FC = () => {
  const navigate = useNavigate();

  // State for filters and pagination
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // State for delete confirmation
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; invoice: Invoice | null }>({
    open: false,
    invoice: null,
  });

  // Queries and mutations
  const { data, isLoading, error } = useInvoices({
    page,
    size,
    status: statusFilter || undefined,
  });

  const deleteMutation = useDeleteInvoice();
  const generatePDFMutation = useGeneratePDF();

  // Handlers
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleView = (invoice: Invoice) => {
    navigate(`/invoices/${invoice.id}`);
  };

  const handleEdit = (invoice: Invoice) => {
    navigate(`/invoices/${invoice.id}/edit`);
  };

  const handleDeleteClick = (invoice: Invoice) => {
    setDeleteDialog({ open: true, invoice });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.invoice) {
      await deleteMutation.mutateAsync(deleteDialog.invoice.id);
      setDeleteDialog({ open: false, invoice: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, invoice: null });
  };

  const handleDownloadPDF = (invoice: Invoice) => {
    generatePDFMutation.mutate({ id: invoice.id, invoiceNumber: invoice.invoiceNumber });
  };

  const handleCreateNew = () => {
    navigate('/invoices/create');
  };

  // Filter invoices by search term and status (client-side filtering)
  const filteredInvoices = data
    ?.filter((invoice) =>
      searchTerm ? invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) : true
    )
    .filter((invoice) => (statusFilter ? invoice.status === statusFilter : true));

  // Client-side pagination
  const paginatedInvoices = filteredInvoices?.slice(page * size, page * size + size);

  if (error) {
    return (
      <Box>
        <Typography color="error">Error al cargar facturas: {error.message}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Facturas
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
          size="large"
        >
          Nueva Factura
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Buscar por número"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 250 }}
            size="small"
          />
          <TextField
            select
            label="Estado"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 200 }}
            size="small"
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="DRAFT">Borrador</MenuItem>
            <MenuItem value="PENDING">Pendiente</MenuItem>
            <MenuItem value="PAID">Pagada</MenuItem>
            <MenuItem value="CANCELLED">Cancelada</MenuItem>
          </TextField>
        </Box>
      </Card>

      {/* Table */}
      {isLoading ? (
        <Card>
          <LoadingSkeleton rows={10} variant="table" />
        </Card>
      ) : !filteredInvoices || filteredInvoices.length === 0 ? (
        <Paper>
          <EmptyState
            title="No hay facturas"
            message={
              searchTerm || statusFilter
                ? 'No se encontraron facturas con los filtros seleccionados'
                : 'Aún no has creado ninguna factura. Comienza creando tu primera factura.'
            }
            actionLabel="Crear primera factura"
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
            labelRowsPerPage="Filas por página"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        title="Eliminar Factura"
        message={`¿Estás seguro de que deseas eliminar la factura ${deleteDialog.invoice?.invoiceNumber}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        severity="error"
      />
    </Box>
  );
};

export default InvoicesListPage;
