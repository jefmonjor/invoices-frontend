import { useNavigate, useSearchParams } from 'react-router-dom';
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
  FormControlLabel,
  Switch,
  Divider,
} from '@mui/material';
import { Receipt as InvoiceIcon, Business as BusinessIcon } from '@mui/icons-material';
import axios from 'axios';
import { apiClient } from '@/api/client';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const registerSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'El email es requerido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  // Company fields (optional based on type)
  createCompany: z.boolean(),
  companyName: z.string().optional(),
  taxId: z.string().optional(),
  companyAddress: z.string().optional(),
  companyPhone: z.string().optional(),
  companyEmail: z.string().email('Email de empresa inválido').optional().or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.createCompany) {
    return !!data.companyName && !!data.taxId;
  }
  return true;
}, {
  message: "Nombre de empresa y CIF son requeridos para crear una empresa",
  path: ["companyName"], // Highlight company name field
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invitationToken = searchParams.get('invitation');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createCompany, setCreateCompany] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      createCompany: false,
    },
  });

  // Watch createCompany to toggle fields visibility
  const watchCreateCompany = watch('createCompany');

  useEffect(() => {
    setCreateCompany(watchCreateCompany);
  }, [watchCreateCompany]);

  // If invitation token is present, disable company creation
  useEffect(() => {
    if (invitationToken) {
      setValue('createCompany', false);
      setCreateCompany(false);
    }
  }, [invitationToken, setValue]);

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const payload: any = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        roles: ['ROLE_USER'],
      };

      if (invitationToken) {
        payload.registrationType = 'JOIN_COMPANY';
        payload.invitationToken = invitationToken;
      } else if (data.createCompany) {
        payload.registrationType = 'NEW_COMPANY';
        payload.companyName = data.companyName;
        payload.taxId = data.taxId;
        payload.companyAddress = data.companyAddress;
        payload.companyPhone = data.companyPhone;
        payload.companyEmail = data.companyEmail;
      } else {
        // Default to NEW_COMPANY if no invitation and not explicitly creating (or maybe handle as error?)
        // For now, let's assume if not creating company and no invitation, it's a standalone user (which might not be allowed in multi-company strict mode)
        // But based on requirements, user MUST belong to a company.
        // So if no invitation, they MUST create a company.
        if (!data.createCompany) {
          setError("Debes crear una empresa o unirte a una existente mediante invitación.");
          setIsSubmitting(false);
          return;
        }
      }

      await apiClient.post('/api/auth/register', payload);

      toast.success('¡Registro exitoso! Ahora puedes iniciar sesión.');
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
            {invitationToken ? 'Unirse a Empresa' : 'Crear Cuenta'}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ width: '100%' }}>
            <Stack spacing={2}>
              <Typography variant="h6" sx={{ mt: 1 }}>Datos Personales</Typography>

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

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
              </Stack>

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

              {!invitationToken && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={createCompany}
                        onChange={(e) => {
                          setValue('createCompany', e.target.checked);
                          setCreateCompany(e.target.checked);
                        }}
                        color="primary"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <BusinessIcon sx={{ mr: 1 }} />
                        <Typography fontWeight="bold">Registrar mi empresa</Typography>
                      </Box>
                    }
                  />

                  {createCompany && (
                    <Stack spacing={2} sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="subtitle2" color="primary">Datos de la Empresa</Typography>

                      <TextField
                        {...register('companyName')}
                        label="Razón Social / Nombre Empresa"
                        fullWidth
                        required={createCompany}
                        error={!!errors.companyName}
                        helperText={errors.companyName?.message}
                        disabled={isSubmitting}
                      />

                      <TextField
                        {...register('taxId')}
                        label="CIF / NIF"
                        fullWidth
                        required={createCompany}
                        error={!!errors.taxId}
                        helperText={errors.taxId?.message}
                        disabled={isSubmitting}
                      />

                      <TextField
                        {...register('companyAddress')}
                        label="Dirección"
                        fullWidth
                        error={!!errors.companyAddress}
                        helperText={errors.companyAddress?.message}
                        disabled={isSubmitting}
                      />

                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                          {...register('companyPhone')}
                          label="Teléfono"
                          fullWidth
                          error={!!errors.companyPhone}
                          helperText={errors.companyPhone?.message}
                          disabled={isSubmitting}
                        />

                        <TextField
                          {...register('companyEmail')}
                          label="Email Empresa"
                          fullWidth
                          error={!!errors.companyEmail}
                          helperText={errors.companyEmail?.message}
                          disabled={isSubmitting}
                        />
                      </Stack>
                    </Stack>
                  )}
                </>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isSubmitting}
                sx={{ mt: 3 }}
              >
                {isSubmitting ? 'Registrando...' : (invitationToken ? 'Unirse a Empresa' : (createCompany ? 'Registrar Cuenta y Empresa' : 'Registrarse'))}
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
