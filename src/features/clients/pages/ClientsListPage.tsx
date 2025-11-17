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

export const ClientsListPage: React.FC = () => {
  const navigate = useNavigate();
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
      ? client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.taxId.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  if (error) {
    return (
      <Box>
        <Typography color="error">Error al cargar clientes: {error.message}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Clientes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
          size="large"
        >
          Nuevo Cliente
        </Button>
      </Box>

      {/* Search */}
      <Card sx={{ p: 2, mb: 3 }}>
        <TextField
          label="Buscar por nombre o CIF/NIF"
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
          title="No hay clientes"
          message={
            searchTerm
              ? 'No se encontraron clientes con el criterio de búsqueda'
              : 'Aún no has registrado ningún cliente. Comienza creando tu primer cliente.'
          }
          actionLabel="Crear primer cliente"
          onAction={handleCreateNew}
        />
      ) : (
        <ClientsTable
          clients={filteredClients}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        title="Eliminar Cliente"
        message={`¿Estás seguro de que deseas eliminar el cliente ${deleteDialog.client?.name}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        severity="error"
      />
    </Box>
  );
};
