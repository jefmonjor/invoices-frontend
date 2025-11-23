import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
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
  ToggleButton,
  ToggleButtonGroup,
  Divider,
} from '@mui/material';
import { Receipt as InvoiceIcon, Business as BusinessIcon, GroupAdd as GroupAddIcon } from '@mui/icons-material';
import axios from 'axios';
import { apiClient } from '@/api/client';
import { useState } from 'react';
import { toast } from 'react-toastify';
import TaxIdField from '@/components/shared/TaxIdField';
import { validateSpanishTaxId } from '@/utils/validators/spanishTaxId';

type RegistrationType = 'new-company' | 'join-company';

const registerSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'El email es requerido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  // Campos para nueva empresa
  companyName: z.string().optional(),
  companyTaxId: z.string().optional(),
  // Campo para unirse a empresa
  invitationCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrationType, setRegistrationType] = useState<RegistrationType>('new-company');
  const [taxIdValid, setTaxIdValid] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      companyName: '',
      companyTaxId: '',
      invitationCode: '',
    },
  });

  const companyTaxId = watch('companyTaxId');

  const onSubmit = async (data: RegisterFormData) => {
    // Validaciones adicionales según tipo de registro
    if (registrationType === 'new-company') {
      if (!data.companyName || data.companyName.trim() === '') {
        setError('El nombre de la empresa es obligatorio');
        return;
      }
      if (!data.companyTaxId || data.companyTaxId.trim() === '') {
        setError('El CIF de la empresa es obligatorio');
        return;
      }
      const validation = validateSpanishTaxId(data.companyTaxId);
      if (!validation.valid) {
        setError(`CIF inválido: ${validation.message}`);
        return;
      }
    } else if (registrationType === 'join-company') {
      if (!data.invitationCode || data.invitationCode.trim() === '') {
        setError('El código de invitación es obligatorio');
        return;
      }
    }

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

      // Añadir datos de empresa si es nuevo registro
      if (registrationType === 'new-company') {
        payload.companyName = data.companyName;
        payload.companyTaxId = data.companyTaxId;
      } else {
        payload.invitationCode = data.invitationCode;
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

          <Typography component="h2" variant="h5" sx={{ mb: 2 }}>
            Crear Cuenta
          </Typography>

          {/* Toggle: Nueva Empresa / Unirse a Empresa */}
          <ToggleButtonGroup
            value={registrationType}
            exclusive
            onChange={(_, newValue) => {
              if (newValue !== null) {
                setRegistrationType(newValue);
                setError(null);
              }
            }}
            fullWidth
            sx={{ mb: 3 }}
          >
            <ToggleButton value="new-company" aria-label="Nueva empresa">
              <BusinessIcon sx={{ mr: 1 }} />
              Nueva Empresa
            </ToggleButton>
            <ToggleButton value="join-company" aria-label="Unirse a empresa">
              <GroupAddIcon sx={{ mr: 1 }} />
              Unirse a Empresa
            </ToggleButton>
          </ToggleButtonGroup>

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

              {/* Campos condicionales según tipo de registro */}
              {registrationType === 'new-company' && (
                <>
                  <Divider sx={{ my: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Datos de la Empresa
                    </Typography>
                  </Divider>

                  <TextField
                    {...register('companyName')}
                    label="Nombre de la Empresa"
                    fullWidth
                    required
                    error={!!errors.companyName}
                    helperText={errors.companyName?.message}
                    disabled={isSubmitting}
                    placeholder="Ej: Mi Empresa S.L."
                  />

                  <Controller
                    name="companyTaxId"
                    control={control}
                    render={({ field }) => (
                      <TaxIdField
                        value={field.value || ''}
                        onChange={field.onChange}
                        label="CIF de la Empresa"
                        name="companyTaxId"
                        required
                        onValidation={(valid, type) => {
                          setTaxIdValid(valid);
                          console.log(`Company Tax ID validation: ${valid}, type: ${type}`);
                        }}
                      />
                    )}
                  />
                </>
              )}

              {registrationType === 'join-company' && (
                <>
                  <Divider sx={{ my: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Unirse a una Empresa Existente
                    </Typography>
                  </Divider>

                  <TextField
                    {...register('invitationCode')}
                    label="Código de Invitación"
                    fullWidth
                    required
                    error={!!errors.invitationCode}
                    helperText={errors.invitationCode?.message || 'Solicita un código de invitación al administrador de tu empresa'}
                    disabled={isSubmitting}
                    placeholder="Ej: ABC123XYZ"
                  />
                </>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isSubmitting || (registrationType === 'new-company' && !taxIdValid)}
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
