import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Card, Typography, TextField, TablePagination } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useUsers, useDeleteUser } from '../hooks/useUsers';
import { UsersTable } from '../components/UsersTable';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import type { User } from '@/types/user.types';

export const UsersListPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null,
  });

  const { data, isLoading, error } = useUsers({ page, size, email: searchTerm || undefined });
  const deleteMutation = useDeleteUser();

  const handleEdit = (user: User) => {
    navigate(`/users/${user.id}/edit`);
  };

  const handleDeleteClick = (user: User) => {
    setDeleteDialog({ open: true, user });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.user) {
      await deleteMutation.mutateAsync(deleteDialog.user.id);
      setDeleteDialog({ open: false, user: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, user: null });
  };

  const handleCreateNew = () => {
    navigate('/users/create');
  };

  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (error) {
    return (
      <Box>
        <Typography color="error">Error al cargar usuarios: {error.message}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestión de Usuarios
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
          size="large"
        >
          Nuevo Usuario
        </Button>
      </Box>

      {/* Search */}
      <Card sx={{ p: 2, mb: 3 }}>
        <TextField
          label="Buscar por email"
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
      ) : !data || data.content.length === 0 ? (
        <EmptyState
          title="No hay usuarios"
          message={
            searchTerm
              ? 'No se encontraron usuarios con el criterio de búsqueda'
              : 'Aún no hay usuarios registrados. Comienza creando el primer usuario.'
          }
          actionLabel="Crear primer usuario"
          onAction={handleCreateNew}
        />
      ) : (
        <>
          <UsersTable
            users={data.content}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
          <Card sx={{ mt: 2 }}>
            <TablePagination
              component="div"
              count={data.totalElements}
              page={page}
              onPageChange={handlePageChange}
              rowsPerPage={size}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Filas por página:"
            />
          </Card>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        title="Eliminar Usuario"
        message={`¿Estás seguro de que deseas eliminar el usuario ${deleteDialog.user?.email}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        severity="error"
      />
    </Box>
  );
};
