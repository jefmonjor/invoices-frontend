import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Card, Typography, TextField } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useClients, useDeleteClient } from '../hooks/useClients';
import { ClientsTable } from '../components/ClientsTable';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import type { Client } from '@/types/client.types';
import { usePermissions } from '@/hooks/usePermissions';
import { useTranslation } from 'react-i18next';

export const ClientsListPage: React.FC = () => {
  const { t } = useTranslation(['clients', 'common']);
  const navigate = useNavigate();
  const { canDeleteClients } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; client: Client | null }>({
    open: false,
    client: null,
  });

  const { data: clients, isLoading, error } = useClients();
  const deleteMutation = useDeleteClient();

  const handleEdit = (client: Client) => {
    navigate(`/clients/${client.id}/edit`);
  };

  const handleDeleteClick = (client: Client) => {
    setDeleteDialog({ open: true, client });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.client) {
      await deleteMutation.mutateAsync(deleteDialog.client.id);
      setDeleteDialog({ open: false, client: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, client: null });
  };

  const handleCreateNew = () => {
    navigate('/clients/create');
  };

  // Filter clients by search term
  const filteredClients = clients?.filter((client) =>
    searchTerm
      ? client.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.taxId.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  if (error) {
    return (
      <Box>
        <Typography color="error">{t('clients:messages.errorLoading')}: {error.message}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {t('clients:title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
          size="large"
        >
          {t('clients:create')}
        </Button>
      </Box>

      {/* Search */}
      <Card sx={{ p: 2, mb: 3 }}>
        <TextField
          label={t('clients:search')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          size="small"
        />
      </Card>

      {/* Table */}
      {isLoading ? (
        <Card>
          <LoadingSkeleton rows={10} variant="table" />
        </Card>
      ) : !filteredClients || filteredClients.length === 0 ? (
        <EmptyState
          title={t('clients:messages.emptyTitle')}
          message={
            searchTerm
              ? t('clients:messages.emptyMessageSearch')
              : t('clients:messages.emptyMessageInit')
          }
          actionLabel={t('clients:messages.createFirst')}
          onAction={handleCreateNew}
        />
      ) : (
        <ClientsTable
          clients={filteredClients}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          canDelete={canDeleteClients}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        title={t('clients:messages.deleteConfirmTitle')}
        message={t('clients:messages.deleteConfirmMessage', { name: deleteDialog.client?.businessName })}
        confirmLabel={t('common:actions.delete')}
        cancelLabel={t('common:actions.cancel')}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        severity="error"
      />
    </Box>
  );
};

export default ClientsListPage;
