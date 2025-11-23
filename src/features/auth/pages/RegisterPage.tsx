import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { useState, useEffect } from 'react';
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
  // Company fields (optional based on type)
  createCompany: z.boolean(),
  companyName: z.string().optional(),
  taxId: z.string().optional(),
  companyAddress: z.string().optional(),
  companyPhone: z.string().optional(),
  companyEmail: z.string().email('Email de empresa inválido').optional().or(z.literal('')),

  // Campos para nueva empresa (alternative names used in other branch)
  companyTaxId: z.string().optional(),
  // Campo para unirse a empresa
  invitationCode: z.string().optional(),
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
  const [registrationType, setRegistrationType] = useState<RegistrationType>('new-company');
  const [taxIdValid, setTaxIdValid] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      createCompany: false,
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

      if (invitationToken) {
        payload.registrationType = 'JOIN_COMPANY';
        payload.invitationToken = invitationToken;
      } else if (data.createCompany || registrationType === 'new-company') {
        payload.registrationType = 'NEW_COMPANY';
        payload.companyName = data.companyName;
        payload.taxId = data.taxId || data.companyTaxId; // Handle both field names
        payload.companyAddress = data.companyAddress;
        payload.companyPhone = data.companyPhone;
        payload.companyEmail = data.companyEmail;
      } else if (registrationType === 'join-company') {
        payload.invitationCode = data.invitationCode;
      } else {
        // Default to NEW_COMPANY if no invitation and not explicitly creating (or maybe handle as error?)
        // For now, let's assume if not creating company and no invitation, it's a standalone user (which might not be allowed in multi-company strict mode)
        // But based on requirements, user MUST belong to a company.
        // So if no invitation, they MUST create a company.
        if (!data.createCompany && registrationType !== 'join-company') {
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

          <Typography component="h2" variant="h5" sx={{ mb: 2 }}>
            {invitationToken ? 'Unirse a Empresa' : 'Crear Cuenta'}
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

                  {/* Toggle between switch (original) and toggle buttons (new) - keeping toggle buttons for better UX */}

                  {registrationType === 'new-company' && (
                    <Stack spacing={2} sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="subtitle2" color="primary">Datos de la Empresa</Typography>

                      <TextField
                        {...register('companyName')}
                        label="Razón Social / Nombre Empresa"
                        fullWidth
                        required={registrationType === 'new-company'}
                        error={!!errors.companyName}
                        helperText={errors.companyName?.message}
                        disabled={isSubmitting}
                      />

                      <Controller
                        name="companyTaxId"
                        control={control}
                        render={({ field }) => (
                          <TaxIdField
                            value={field.value || ''}
                            onChange={(value) => {
                              field.onChange(value);
                              setValue('taxId', value); // Sync with taxId field
                            }}
                            label="CIF / NIF"
                            name="companyTaxId"
                            required={registrationType === 'new-company'}
                            onValidation={(valid) => {
                              setTaxIdValid(valid);
                            }}
                          />
                        )}
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

                </>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isSubmitting || (registrationType === 'new-company' && !taxIdValid)}
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
            </Stack >
          </Box >
        </Paper >
      </Box >
    </Container >
  );
};

export default RegisterPage;
