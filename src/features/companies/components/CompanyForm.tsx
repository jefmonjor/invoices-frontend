import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, TextField, Button, Stack, Grid } from '@mui/material';
import type { Company, CreateCompanyRequest } from '@/types/company.types';

const companySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200, 'Máximo 200 caracteres'),
  taxId: z.string().min(1, 'El CIF/NIF es requerido').max(20, 'Máximo 20 caracteres'),
  address: z.string().min(1, 'La dirección es requerida').max(500, 'Máximo 500 caracteres'),
  email: z.string().email('Email inválido').min(1, 'El email es requerido'),
  phone: z.string().max(20, 'Máximo 20 caracteres').optional(),
});

interface CompanyFormProps {
  initialData?: Company;
  onSubmit: (data: CreateCompanyRequest) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const CompanyForm: React.FC<CompanyFormProps> = ({
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
  } = useForm<CreateCompanyRequest>({
    resolver: zodResolver(companySchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          taxId: initialData.taxId,
          address: initialData.address,
          email: initialData.email,
          phone: initialData.phone || '',
        }
      : {
          name: '',
          taxId: '',
          address: '',
          email: '',
          phone: '',
        },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        taxId: initialData.taxId,
        address: initialData.address,
        email: initialData.email,
        phone: initialData.phone || '',
      });
    }
  }, [initialData, reset]);

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Grid container spacing={3}>
        <Grid xs={12} md={6}>
          <TextField
            {...register('name')}
            label="Nombre de la Empresa"
            fullWidth
            required
            error={!!errors.name}
            helperText={errors.name?.message}
            disabled={isSubmitting}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <TextField
            {...register('taxId')}
            label="CIF/NIF"
            fullWidth
            required
            error={!!errors.taxId}
            helperText={errors.taxId?.message}
            disabled={isSubmitting}
          />
        </Grid>

        <Grid xs={12}>
          <TextField
            {...register('address')}
            label="Dirección"
            fullWidth
            required
            error={!!errors.address}
            helperText={errors.address?.message}
            disabled={isSubmitting}
          />
        </Grid>

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
            {...register('phone')}
            label="Teléfono (Opcional)"
            fullWidth
            error={!!errors.phone}
            helperText={errors.phone?.message}
            disabled={isSubmitting}
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
