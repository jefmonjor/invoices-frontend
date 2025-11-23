import { Box, Typography, Card, CardContent, Grid, Divider, Alert, CircularProgress, Button, FormControlLabel, Checkbox, Chip } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Edit as EditIcon, GroupAdd as GroupAddIcon } from '@mui/icons-material';
import { TextField, Stack } from '@mui/material';
import { useProfile, useUpdateProfile } from '../hooks/useUsers';
import { useState, useEffect } from 'react';
import { useCompanyContext } from '@/contexts/CompanyContext';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('auth');
  const { data: user, isLoading, error } = useProfile();
  const updateMutation = useUpdateProfile();
  const [isAdmin, setIsAdmin] = useState(false);
  const { currentCompany, userCompanies, switchCompany } = useCompanyContext();

  useEffect(() => {
    if (user) {
      setIsAdmin(user.roles.includes('ROLE_ADMIN'));
    }
  }, [user]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Update form values when user data is loaded
  useEffect(() => {
    if (user) {
      setIsAdmin(user.roles.includes('ROLE_ADMIN'));
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        password: '',
        confirmPassword: '',
      });
    }
  }, [user, reset]);

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
          {t('profile.title')}
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
          {t('profile.title')}
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
        {t('profile.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('profile.subtitle')}
      </Typography>

      <Grid container spacing={3}>
        {/* Información de la Cuenta */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('profile.accountInfo')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  {t('profile.email')}
                </Typography>
                <Typography variant="body1">{user.email}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  {t('profile.roles')}
                </Typography>
                <Typography variant="body1">{user.roles.join(', ')}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  {t('profile.status')}
                </Typography>
                <Typography variant="body1">
                  {user.enabled ? t('profile.active') : t('profile.inactive')}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Mis Empresas - Panel activo con CompanyContext */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {t('profile.myCompanies')}
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {userCompanies.length === 0 ? (
                <Alert severity="info">
                  {t('profile.companiesComingSoon')}
                </Alert>
              ) : (
                <Stack spacing={2}>
                  {userCompanies.map((userCompany) => {
                    const isCurrentCompany = currentCompany?.id === userCompany.companyId;

                    return (
                      <Box
                        key={userCompany.companyId}
                        sx={{
                          p: 2,
                          border: isCurrentCompany ? '2px solid' : '1px solid',
                          borderColor: isCurrentCompany ? 'primary.main' : 'divider',
                          borderRadius: 1,
                          bgcolor: isCurrentCompany ? 'action.hover' : 'transparent',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="subtitle1" fontWeight={isCurrentCompany ? 'bold' : 'normal'}>
                              {userCompany.company.businessName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              CIF: {userCompany.company.taxId}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={userCompany.role === 'ADMIN' ? t('common:company.role.admin') : t('common:company.role.user')}
                              color={userCompany.role === 'ADMIN' ? 'primary' : 'default'}
                              size="small"
                            />
                            {!isCurrentCompany && (
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => switchCompany(userCompany.companyId)}
                              >
                                {t('common:actions.change')}
                              </Button>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              )}

              {isAdmin && userCompanies.length > 0 && (
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ mt: 2 }}
                  startIcon={<GroupAddIcon />}
                >
                  {t('profile.inviteUsers')}
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Editar Perfil */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('profile.editProfile')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <Stack spacing={2}>
                  <TextField
                    {...register('firstName')}
                    label={t('register.firstName')}
                    fullWidth
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                    disabled={updateMutation.isPending}
                    InputProps={{
                      endAdornment: <EditIcon color="action" fontSize="small" />,
                    }}
                  />
                  <TextField
                    {...register('lastName')}
                    label={t('register.lastName')}
                    fullWidth
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                    disabled={updateMutation.isPending}
                    InputProps={{
                      endAdornment: <EditIcon color="action" fontSize="small" />,
                    }}
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
                    label={t('profile.isAdmin')}
                  />
                  <Divider />
                  <Typography variant="caption" color="text.secondary">
                    {t('profile.changePassword')}
                  </Typography>
                  <TextField
                    {...register('password')}
                    label={t('profile.newPassword')}
                    type="password"
                    fullWidth
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    disabled={updateMutation.isPending}
                  />
                  <TextField
                    {...register('confirmPassword')}
                    label={t('profile.confirmNewPassword')}
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
                    {updateMutation.isPending ? t('common:app.loading') : t('common:actions.save')}
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
