import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import { ClientForm } from '../components/ClientForm';
import { useClient, useUpdateClient } from '../hooks/useClients';
import type { CreateClientRequest } from '@/types/client.types';

export const ClientEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const clientId = parseInt(id || '0', 10);

  const { data: client, isLoading, error } = useClient(clientId);
  const updateMutation = useUpdateClient();

  const handleSubmit = async (data: CreateClientRequest) => {
    try {
      await updateMutation.mutateAsync({ id: clientId, data });
      navigate('/clients');
    } catch (error) {
      // Error is handled by the mutation
      console.error('Error updating client:', error);
    }
  };

  const handleCancel = () => {
    navigate('/clients');
  };

  if (isLoading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Editar Cliente
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error || !client) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Editar Cliente
        </Typography>
        <Alert severity="error">
          Error al cargar el cliente: {error?.message || 'Cliente no encontrado'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Editar Cliente: {client.name}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Modifica los datos del cliente
      </Typography>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <ClientForm
            initialData={client}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={updateMutation.isPending}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default ClientEditPage;
