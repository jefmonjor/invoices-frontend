import { Box, Typography, Card, CardContent, Grid, Divider, Alert, CircularProgress, Button, FormControlLabel, Checkbox, Chip } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Edit as EditIcon, GroupAdd as GroupAddIcon } from '@mui/icons-material';
import { TextField, Stack } from '@mui/material';
import { useProfile, useUpdateProfile } from '../hooks/useUsers';
import { useState, useEffect, useMemo } from 'react';
import { useCompanyContext } from '@/contexts/useCompanyContext';
import { useTranslation } from 'react-i18next';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import InviteUserModal from '@/features/companies/components/InviteUserModal';

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
  const { currentCompany, userCompanies, switchCompany } = useCompanyContext();

  // Derive isAdmin from user instead of using state
  const isAdmin = useMemo(() => user?.roles?.includes('ROLE_ADMIN') ?? false, [user]);

  // Modal State
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);

  const handleOpenInviteModal = (companyId: number) => {
    setSelectedCompanyId(companyId);
    setInviteModalOpen(true);
  };

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
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('common:company.fields.name', 'Nombre')}</TableCell>
                        <TableCell>{t('common:company.fields.taxId', 'CIF/NIF')}</TableCell>
                        <TableCell>{t('common:company.fields.role', 'Rol')}</TableCell>
                        <TableCell align="right">{t('common:actions.title', 'Acciones')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {userCompanies.map((company) => {
                        const isCurrentCompany = currentCompany?.id === company.id;
                        return (
                          <TableRow
                            key={company.id}
                            selected={isCurrentCompany}
                            sx={{ '&.Mui-selected': { bgcolor: 'action.selected' } }}
                          >
                            <TableCell>
                              <Typography variant="body2" fontWeight={isCurrentCompany ? 'bold' : 'normal'}>
                                {company.businessName}
                              </Typography>
                            </TableCell>
                            <TableCell>{company.taxId}</TableCell>
                            <TableCell>
                              <Chip
                                label={company.role === 'ADMIN' ? t('common:company.role.admin') : t('common:company.role.user')}
                                color={company.role === 'ADMIN' ? 'primary' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Stack direction="row" spacing={1} justifyContent="flex-end">
                                {!isCurrentCompany && (
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => switchCompany(company.id)}
                                  >
                                    {t('common:actions.switch', 'Cambiar')}
                                  </Button>
                                )}
                                {company.role === 'ADMIN' && (
                                  <Button
                                    size="small"
                                    variant="text"
                                    startIcon={<GroupAddIcon />}
                                    onClick={() => handleOpenInviteModal(company.id)}
                                  >
                                    {t('common:actions.invite', 'Invitar')}
                                  </Button>
                                )}
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <InviteUserModal
          open={inviteModalOpen}
          onClose={() => setInviteModalOpen(false)}
          companyId={selectedCompanyId || 0}
        />

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
                    InputLabelProps={{ shrink: true }}
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
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      endAdornment: <EditIcon color="action" fontSize="small" />,
                    }}
                  />
                  <Divider />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isAdmin}
                        disabled
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
