import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import { UserForm } from '../components/UserForm';
import { useUser, useUpdateUser } from '../hooks/useUsers';
import type { UpdateUserRequest } from '@/types/user.types';

export const UserEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userId = parseInt(id || '0', 10);

  const { data: user, isLoading, error } = useUser(userId);
  const updateMutation = useUpdateUser();

  const handleSubmit = async (data: UpdateUserRequest) => {
    try {
      // Si la contraseña está vacía, no la enviamos
      const updateData = { ...data };
      if (!updateData.password) {
        delete updateData.password;
      }

      await updateMutation.mutateAsync({ id: userId, data: updateData });
      navigate('/users');
    } catch (error) {
      // Error is handled by the mutation
      console.error('Error updating user:', error);
    }
  };

  const handleCancel = () => {
    navigate('/users');
  };

  if (isLoading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Editar Usuario
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error || !user) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Editar Usuario
        </Typography>
        <Alert severity="error">
          Error al cargar el usuario: {error?.message || 'Usuario no encontrado'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Editar Usuario: {user.email}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Modifica los datos del usuario
      </Typography>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <UserForm
            initialData={user}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={updateMutation.isPending}
          />
        </CardContent>
      </Card>
    </Box>
  );
};
