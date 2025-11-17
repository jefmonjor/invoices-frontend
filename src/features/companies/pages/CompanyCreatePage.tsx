import { useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { CompanyForm } from '../components/CompanyForm';
import { useCreateCompany } from '../hooks/useCompanies';
import type { CreateCompanyRequest } from '@/types/company.types';

export const CompanyCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreateCompany();

  const handleSubmit = async (data: CreateCompanyRequest) => {
    try {
      await createMutation.mutateAsync(data);
      navigate('/companies');
    } catch (error) {
      // Error is handled by the mutation
      console.error('Error creating company:', error);
    }
  };

  const handleCancel = () => {
    navigate('/companies');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Nueva Empresa
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Completa los datos para registrar una nueva empresa
      </Typography>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <CompanyForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={createMutation.isPending}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default CompanyCreatePage;
