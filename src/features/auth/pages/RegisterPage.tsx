import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Stack,
  Link,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  useTheme,
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
  const [registrationType, setRegistrationType] = useState<RegistrationType>('new-company');
  const [taxIdValid, setTaxIdValid] = useState(false);

  const {
    register,
    handleSubmit,
    control,
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

  // If invitation token is present, disable company creation
  useEffect(() => {
    if (invitationToken) {
      setValue('createCompany', false);
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

  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Left Side - Branding (Desktop Only) */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 4,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Abstract shapes for visual interest */}
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            left: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.1)',
            filter: 'blur(80px)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -50,
            right: -50,
            width: 300,
            height: 300,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.1)',
            filter: 'blur(60px)',
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 480 }}>
          <InvoiceIcon sx={{ fontSize: 80, mb: 2, opacity: 0.9 }} />
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Invoices App
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 400 }}>
            La plataforma de facturación inteligente para empresas modernas.
          </Typography>
        </Box>
      </Box>

      {/* Right Side - Form */}
      <Box
        sx={{
          flex: { xs: 1, md: '0 0 550px' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          p: { xs: 3, sm: 6 },
          bgcolor: 'background.paper',
          overflowY: 'auto',
        }}
      >
        <Container maxWidth="sm">
          {/* Mobile Logo */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', mb: 4, justifyContent: 'center' }}>
            <InvoiceIcon sx={{ fontSize: 40, color: 'primary.main', mr: 1 }} />
            <Typography variant="h5" fontWeight="bold" color="primary">
              Invoices App
            </Typography>
          </Box>

          <Box sx={{ mb: 4, textAlign: { xs: 'center', md: 'left' } }}>
            <Typography component="h1" variant="h4" fontWeight="bold" gutterBottom>
              {invitationToken ? 'Únete a tu equipo' : 'Crea tu cuenta'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {invitationToken
                ? 'Has sido invitado a colaborar. Completa tus datos para empezar.'
                : 'Comienza a gestionar tu facturación en minutos.'}
            </Typography>
          </Box>

          {/* Toggle: Nueva Empresa / Unirse a Empresa */}
          {!invitationToken && (
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
              sx={{ mb: 4 }}
            >
              <ToggleButton value="new-company" sx={{ py: 1.5 }}>
                <BusinessIcon sx={{ mr: 1 }} />
                Nueva Empresa
              </ToggleButton>
              <ToggleButton value="join-company" sx={{ py: 1.5 }}>
                <GroupAddIcon sx={{ mr: 1 }} />
                Unirse a Empresa
              </ToggleButton>
            </ToggleButtonGroup>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2, color: 'text.primary' }}>
                  Datos Personales
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    {...register('email')}
                    label="Correo Electrónico"
                    type="email"
                    fullWidth
                    required
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    disabled={isSubmitting}
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
                    />
                    <TextField
                      {...register('lastName')}
                      label="Apellido"
                      fullWidth
                      required
                      error={!!errors.lastName}
                      helperText={errors.lastName?.message}
                      disabled={isSubmitting}
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
                  />
                </Stack>
              </Box>

              {!invitationToken && (
                <Box>
                  <Divider sx={{ my: 1 }} />

                  {registrationType === 'new-company' && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2, color: 'primary.main' }}>
                        Datos de la Empresa
                      </Typography>
                      <Stack spacing={2}>
                        <TextField
                          {...register('companyName')}
                          label="Razón Social"
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
                                setValue('taxId', value);
                              }}
                              label="CIF / NIF"
                              name="companyTaxId"
                              required={registrationType === 'new-company'}
                              onValidation={(valid) => setTaxIdValid(valid)}
                            />
                          )}
                        />

                        <TextField
                          {...register('companyAddress')}
                          label="Dirección Fiscal"
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
                    </Box>
                  )}

                  {registrationType === 'join-company' && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2, color: 'primary.main' }}>
                        Unirse a Equipo
                      </Typography>
                      <TextField
                        {...register('invitationCode')}
                        label="Código de Invitación"
                        fullWidth
                        required
                        placeholder="Ej: ABC-123-XYZ"
                        error={!!errors.invitationCode}
                        helperText={errors.invitationCode?.message || 'Pídele el código al administrador de tu empresa'}
                        disabled={isSubmitting}
                      />
                    </Box>
                  )}
                </Box>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isSubmitting || (registrationType === 'new-company' && !taxIdValid)}
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  boxShadow: theme.shadows[4],
                  '&:hover': {
                    boxShadow: theme.shadows[8],
                  }
                }}
              >
                {isSubmitting ? 'Procesando...' : (invitationToken ? 'Unirse al Equipo' : 'Crear Cuenta')}
              </Button>

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  ¿Ya tienes una cuenta?{' '}
                  <Link
                    component="button"
                    variant="subtitle2"
                    onClick={() => navigate('/login')}
                    sx={{ fontWeight: 'bold', textDecoration: 'none' }}
                  >
                    Iniciar Sesión
                  </Link>
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default RegisterPage;
