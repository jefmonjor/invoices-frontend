import { useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { ClientForm } from '../components/ClientForm';
import { useCreateClient } from '../hooks/useClients';
import type { CreateClientRequest } from '@/types/client.types';

export const ClientCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreateClient();

  const handleSubmit = async (data: CreateClientRequest) => {
    try {
      await createMutation.mutateAsync(data);
      navigate('/clients');
    } catch (error) {
      // Error is handled by the mutation
      console.error('Error creating client:', error);
    }
  };

  const handleCancel = () => {
    navigate('/clients');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Nuevo Cliente
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Completa los datos para registrar un nuevo cliente
      </Typography>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <ClientForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={createMutation.isPending}
          />
        </CardContent>
      </Card>
    </Box>
  );
};
