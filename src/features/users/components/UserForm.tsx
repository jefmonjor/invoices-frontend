import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  TextField,
  Button,
  Stack,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  FormControlLabel,
  Switch,
  FormHelperText,
} from '@mui/material';
import type { User } from '@/types/user.types';

const AVAILABLE_ROLES = ['ROLE_USER', 'ROLE_ADMIN'];

const userSchema = z.object({
  email: z.string().min(1, 'El email es requerido').email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional().or(z.literal('')),
  firstName: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  lastName: z.string().min(1, 'El apellido es requerido').max(100, 'Máximo 100 caracteres'),
  roles: z.array(z.string()).min(1, 'Debe seleccionar al menos un rol'),
  enabled: z.boolean().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  initialData?: User;
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const UserForm: React.FC<UserFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: initialData
      ? {
          email: initialData.email,
          password: '',
          firstName: initialData.firstName,
          lastName: initialData.lastName,
          roles: initialData.roles,
          enabled: initialData.enabled,
        }
      : {
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          roles: ['ROLE_USER'],
          enabled: true,
        },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        email: initialData.email,
        password: '',
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        roles: initialData.roles,
        enabled: initialData.enabled,
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data: UserFormData) => {
    onSubmit(data);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <Grid container spacing={3}>
        <Grid xs={12} md={6}>
          <TextField
            {...register('email')}
            label="Email"
            type="email"
            fullWidth
            required
            error={!!errors.email}
            helperText={errors.email?.message}
            disabled={isSubmitting}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <TextField
            {...register('password')}
            label={initialData ? 'Contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
            type="password"
            fullWidth
            required={!initialData}
            error={!!errors.password}
            helperText={errors.password?.message}
            disabled={isSubmitting}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <TextField
            {...register('firstName')}
            label="Nombre"
            fullWidth
            required
            error={!!errors.firstName}
            helperText={errors.firstName?.message}
            disabled={isSubmitting}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <TextField
            {...register('lastName')}
            label="Apellido"
            fullWidth
            required
            error={!!errors.lastName}
            helperText={errors.lastName?.message}
            disabled={isSubmitting}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <Controller
            name="roles"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.roles}>
                <InputLabel id="roles-label">Roles</InputLabel>
                <Select
                  {...field}
                  labelId="roles-label"
                  id="roles-select"
                  multiple
                  input={<OutlinedInput label="Roles" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                  disabled={isSubmitting}
                >
                  {AVAILABLE_ROLES.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </Select>
                {errors.roles && <FormHelperText>{errors.roles.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <Controller
            name="enabled"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch {...field} checked={field.value} disabled={isSubmitting} />}
                label="Usuario Activo"
              />
            )}
          />
        </Grid>
      </Grid>

      <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
        <Button variant="outlined" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear'}
        </Button>
      </Stack>
    </Box>
  );
};
