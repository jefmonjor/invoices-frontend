import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  Stack,
  Link,
  Alert,
} from '@mui/material';
import { Receipt as InvoiceIcon } from '@mui/icons-material';
import axios from 'axios';
import { apiClient } from '@/api/client';
import { useState } from 'react';
import { toast } from 'react-toastify';

const registerSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'El email es requerido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.post('/auth/register', {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        roles: ['ROLE_USER'], // Default role
      });

      toast.success('Registro exitoso! Por favor inicia sesión.');
      navigate('/login');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || 'Error al registrarse. Por favor intenta nuevamente.';
        setError(message);
      } else {
        setError('Error al registrarse. Por favor intenta nuevamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <InvoiceIcon sx={{ fontSize: 40, color: 'primary.main', mr: 1 }} />
            <Typography component="h1" variant="h4" color="primary">
              Invoices App
            </Typography>
          </Box>

          <Typography component="h2" variant="h5" sx={{ mb: 3 }}>
            Crear Cuenta
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ width: '100%' }}>
            <Stack spacing={2}>
              <TextField
                {...register('email')}
                label="Email"
                type="email"
                fullWidth
                required
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={isSubmitting}
                autoComplete="email"
              />

              <TextField
                {...register('firstName')}
                label="Nombre"
                fullWidth
                required
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
                disabled={isSubmitting}
                autoComplete="given-name"
              />

              <TextField
                {...register('lastName')}
                label="Apellido"
                fullWidth
                required
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
                disabled={isSubmitting}
                autoComplete="family-name"
              />

              <TextField
                {...register('password')}
                label="Contraseña"
                type="password"
                fullWidth
                required
                error={!!errors.password}
                helperText={errors.password?.message}
                disabled={isSubmitting}
                autoComplete="new-password"
              />

              <TextField
                {...register('confirmPassword')}
                label="Confirmar Contraseña"
                type="password"
                fullWidth
                required
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                disabled={isSubmitting}
                autoComplete="new-password"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isSubmitting}
                sx={{ mt: 2 }}
              >
                {isSubmitting ? 'Registrando...' : 'Registrarse'}
              </Button>

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  ¿Ya tienes cuenta?{' '}
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => navigate('/login')}
                    sx={{ cursor: 'pointer' }}
                  >
                    Iniciar Sesión
                  </Link>
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage;
