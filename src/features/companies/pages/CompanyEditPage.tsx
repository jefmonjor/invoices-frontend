import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import { CompanyForm } from '../components/CompanyForm';
import { useCompany, useUpdateCompany } from '../hooks/useCompanies';
import type { CreateCompanyRequest } from '@/types/company.types';

export const CompanyEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const companyId = parseInt(id || '0', 10);

  const { data: company, isLoading, error } = useCompany(companyId);
  const updateMutation = useUpdateCompany();

  const handleSubmit = async (data: CreateCompanyRequest) => {
    try {
      await updateMutation.mutateAsync({ id: companyId, data });
      navigate('/companies');
    } catch (error) {
      // Error is handled by the mutation
      console.error('Error updating company:', error);
    }
  };

  const handleCancel = () => {
    navigate('/companies');
  };

  if (isLoading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Editar Empresa
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error || !company) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Editar Empresa
        </Typography>
        <Alert severity="error">
          Error al cargar la empresa: {error?.message || 'Empresa no encontrada'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Editar Empresa: {company.name}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Modifica los datos de la empresa
      </Typography>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <CompanyForm
            initialData={company}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={updateMutation.isPending}
          />
        </CardContent>
      </Card>
    </Box>
  );
};
