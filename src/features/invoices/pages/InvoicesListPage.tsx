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
import { useQueryClient } from '@tanstack/react-query';
import { useInvoices, useDeleteInvoice, useGeneratePDF, invoiceKeys } from '../hooks/useInvoices';
import { useWebSocketCompanyInvoices } from '../hooks/useWebSocketCompanyInvoices';
import { useCurrentCompanyId } from '@/contexts/CompanyContext';
import { InvoiceTable } from '../components/InvoiceTable';
import { TableSkeleton } from '@/components/common/Skeletons';

// ... imports

export const InvoicesListPage: React.FC = () => {
  // ... existing code

  {/* Table */ }
  {
    isLoading ? (
      <Card>
        <TableSkeleton rows={10} columns={7} />
      </Card>
    ) : !filteredInvoices || filteredInvoices.length === 0 ? (
      <Paper>
        <EmptyState
          title={t('invoices:messages.emptyTitle')}
          message={
            searchTerm || statusFilter
              ? t('invoices:messages.emptyMessage')
              : t('invoices:messages.emptyMessageInit')
          }
          actionLabel={t('invoices:messages.createFirst')}
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
          canEdit={canEditInvoice}
          canDelete={canDeleteInvoice}
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
    )
  }

  {/* Delete Confirmation Dialog */ }
  <ConfirmDialog
    open={deleteDialog.open}
    title={t('invoices:messages.deleteConfirmTitle')}
    message={t('invoices:messages.deleteConfirmMessage', { number: deleteDialog.invoice?.invoiceNumber })}
    confirmLabel={t('common:actions.delete')}
    cancelLabel={t('common:actions.cancel')}
    onConfirm={handleDeleteConfirm}
    onCancel={handleDeleteCancel}
    severity="error"
  />
    </Box >
  );
};

export default InvoicesListPage;
