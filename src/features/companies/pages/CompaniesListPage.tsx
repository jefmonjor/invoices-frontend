import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Card, Typography, TextField } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useCompanies, useDeleteCompany } from '../hooks/useCompanies';
import { CompaniesTable } from '../components/CompaniesTable';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import type { Company } from '@/types/company.types';

export const CompaniesListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; company: Company | null }>({
    open: false,
    company: null,
  });

  const { data: companies, isLoading, error } = useCompanies();
  const deleteMutation = useDeleteCompany();

  const handleEdit = (company: Company) => {
    navigate(`/companies/${company.id}/edit`);
  };

  const handleDeleteClick = (company: Company) => {
    setDeleteDialog({ open: true, company });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.company) {
      await deleteMutation.mutateAsync(deleteDialog.company.id);
      setDeleteDialog({ open: false, company: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, company: null });
  };

  const handleCreateNew = () => {
    navigate('/companies/create');
  };

  // Filter companies by search term
  const filteredCompanies = companies?.filter((company) =>
    searchTerm
      ? company.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.taxId.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  if (error) {
    return (
      <Box>
        <Typography color="error">Error al cargar empresas: {error.message}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Empresas
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
          size="large"
        >
          Nueva Empresa
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
      ) : !filteredCompanies || filteredCompanies.length === 0 ? (
        <EmptyState
          title="No hay empresas"
          message={
            searchTerm
              ? 'No se encontraron empresas con el criterio de búsqueda'
              : 'Aún no has registrado ninguna empresa. Comienza creando tu primera empresa.'
          }
          actionLabel="Crear primera empresa"
          onAction={handleCreateNew}
        />
      ) : (
        <CompaniesTable
          companies={filteredCompanies}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        title="Eliminar Empresa"
        message={`¿Estás seguro de que deseas eliminar la empresa ${deleteDialog.company?.businessName}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        severity="error"
      />
    </Box>
  );
};

export default CompaniesListPage;
