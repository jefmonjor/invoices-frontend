import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import { ClientForm } from '../components/ClientForm';
import { useClient, useUpdateClient } from '../hooks/useClients';
import type { CreateClientRequest } from '@/types/client.types';
import { useTranslation } from 'react-i18next';

export const ClientEditPage: React.FC = () => {
  const { t } = useTranslation(['clients', 'common']);
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
          {t('clients:edit')}
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
          {t('clients:edit')}
        </Typography>
        <Alert severity="error">
          {t('clients:messages.errorLoadingClient', 'Error al cargar el cliente')}: {error?.message || t('clients:messages.clientNotFound', 'Cliente no encontrado')}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {t('clients:edit')}: {client.businessName}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('clients:messages.editSubtitle', 'Modifica los datos del cliente')}
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
