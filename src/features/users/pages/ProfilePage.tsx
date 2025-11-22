import { Box, Typography, Card, CardContent, Grid, Divider, Alert, CircularProgress, Button, FormControlLabel, Checkbox } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextField, Stack } from '@mui/material';
import { useProfile, useUpdateProfile } from '../hooks/useUsers';
import { useState, useEffect } from 'react';

const profileSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  lastName: z.string().min(1, 'El apellido es requerido').max(100, 'Máximo 100 caracteres'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional().or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
}).refine((data) => !data.password || data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const ProfilePage: React.FC = () => {
  const { data: user, isLoading, error } = useProfile();
  const updateMutation = useUpdateProfile();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      setIsAdmin(user.roles.includes('ROLE_ADMIN'));
    }
  }, [user]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: user
      ? {
        firstName: user.firstName,
        lastName: user.lastName,
        password: '',
        confirmPassword: '',
      }
      : undefined,
  });

  const onSubmit = async (data: ProfileFormData) => {
    const updateData: {
      firstName: string;
      lastName: string;
      password?: string;
      roles?: string[];
    } = {
      firstName: data.firstName,
      lastName: data.lastName,
      roles: isAdmin ? ['ROLE_ADMIN'] : ['ROLE_USER'],
    };

    // Solo enviar password si se ha ingresado
    if (data.password) {
      updateData.password = data.password;
    }

    try {
      await updateMutation.mutateAsync(updateData);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (isLoading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Mi Perfil
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
          Mi Perfil
        </Typography>
        <Alert severity="error">
          Error al cargar el perfil: {error?.message || 'Perfil no encontrado'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Mi Perfil
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Gestiona tu información personal y seguridad de la cuenta
      </Typography>

      <Grid container spacing={3}>
        {/* Información de la Cuenta */}
        <Grid xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Información de la Cuenta
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">{user.email}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Roles
                </Typography>
                <Typography variant="body1">{user.roles.join(', ')}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Estado
                </Typography>
                <Typography variant="body1">
                  {user.enabled ? 'Activo' : 'Inactivo'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Editar Perfil */}
        <Grid xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Editar Perfil
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <Stack spacing={2}>
                  <TextField
                    {...register('firstName')}
                    label="Nombre"
                    fullWidth
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                    disabled={updateMutation.isPending}
                  />
                  <TextField
                    {...register('lastName')}
                    label="Apellido"
                    fullWidth
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                    disabled={updateMutation.isPending}
                  />
                  <Divider />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isAdmin}
                        onChange={(e) => setIsAdmin(e.target.checked)}
                        disabled={updateMutation.isPending}
                      />
                    }
                    label="Es Administrador"
                  />
                  <Divider />
                  <Typography variant="caption" color="text.secondary">
                    Cambiar Contraseña (opcional)
                  </Typography>
                  <TextField
                    {...register('password')}
                    label="Nueva Contraseña"
                    type="password"
                    fullWidth
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    disabled={updateMutation.isPending}
                  />
                  <TextField
                    {...register('confirmPassword')}
                    label="Confirmar Nueva Contraseña"
                    type="password"
                    fullWidth
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    disabled={updateMutation.isPending}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;
