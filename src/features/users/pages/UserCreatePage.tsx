import { useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { UserForm } from '../components/UserForm';
import { useCreateUser } from '../hooks/useUsers';
import type { CreateUserRequest } from '@/types/user.types';

export const UserCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreateUser();

  const handleSubmit = async (data: CreateUserRequest) => {
    try {
      await createMutation.mutateAsync(data);
      navigate('/users');
    } catch (error) {
      // Error is handled by the mutation
      console.error('Error creating user:', error);
    }
  };

  const handleCancel = () => {
    navigate('/users');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Nuevo Usuario
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Completa los datos para registrar un nuevo usuario
      </Typography>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <UserForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={createMutation.isPending}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserCreatePage;
