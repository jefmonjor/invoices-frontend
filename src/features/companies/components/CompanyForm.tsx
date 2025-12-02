import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, TextField, Button, Stack, Grid } from '@mui/material';
import type { Company, CreateCompanyRequest } from '@/types/company.types';
import TaxIdField from '@/components/shared/TaxIdField';

const companySchema = z.object({
  // REQUIRED fields (matching backend @NotBlank)
  businessName: z.string().min(1, 'La razón social es requerida').max(200, 'Máximo 200 caracteres'),
  taxId: z.string().min(1, 'El CIF/NIF es requerido').max(50, 'Máximo 50 caracteres'),
  address: z.string().min(1, 'La dirección es requerida').max(500, 'Máximo 500 caracteres'),

  // OPTIONAL fields (no backend validation)
  city: z.string().max(100, 'Máximo 100 caracteres').optional().or(z.literal('')),
  postalCode: z.string().max(10, 'Máximo 10 caracteres').optional().or(z.literal('')),
  province: z.string().max(100, 'Máximo 100 caracteres').optional().or(z.literal('')),
  phone: z.string().max(20, 'Máximo 20 caracteres').optional().or(z.literal('')),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  iban: z.string().max(34, 'Máximo 34 caracteres').optional().or(z.literal('')),
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
    control,
  } = useForm<CreateCompanyRequest>({
    resolver: zodResolver(companySchema),
    defaultValues: initialData
      ? {
        businessName: initialData.businessName,
        taxId: initialData.taxId,
        address: initialData.address,
        city: initialData.city,
        postalCode: initialData.postalCode,
        province: initialData.province,
        phone: initialData.phone,
        email: initialData.email,
        iban: initialData.iban,
      }
      : {
        businessName: '',
        taxId: '',
        address: '',
        city: '',
        postalCode: '',
        province: '',
        phone: '',
        email: '',
        iban: '',
      },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        businessName: initialData.businessName,
        taxId: initialData.taxId,
        address: initialData.address,
        city: initialData.city,
        postalCode: initialData.postalCode,
        province: initialData.province,
        phone: initialData.phone,
        email: initialData.email,
        iban: initialData.iban,
      });
    }
  }, [initialData, reset]);

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Grid container spacing={6}>
        <Grid xs={12} md={6}>
          <TextField
            {...register('businessName')}
            label="Razón Social"
            fullWidth
            required
            error={!!errors.businessName}
            helperText={errors.businessName?.message}
            disabled={isSubmitting}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <Controller
            name="taxId"
            control={control}
            render={({ field }) => (
              <TaxIdField
                value={field.value}
                onChange={field.onChange}
                label="CIF/NIF"
                name="taxId"
                required
                onValidation={(valid, type) => {
                  console.log(`Tax ID validation: ${valid}, type: ${type}`);
                }}
              />
            )}
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

        <Grid xs={12} md={4}>
          <TextField
            {...register('city')}
            label="Ciudad"
            fullWidth
            error={!!errors.city}
            helperText={errors.city?.message}
            disabled={isSubmitting}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <TextField
            {...register('postalCode')}
            label="Código Postal"
            fullWidth
            error={!!errors.postalCode}
            helperText={errors.postalCode?.message}
            disabled={isSubmitting}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <TextField
            {...register('province')}
            label="Provincia"
            fullWidth
            error={!!errors.province}
            helperText={errors.province?.message}
            disabled={isSubmitting}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <TextField
            {...register('phone')}
            label="Teléfono"
            fullWidth
            error={!!errors.phone}
            helperText={errors.phone?.message}
            disabled={isSubmitting}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <TextField
            {...register('email')}
            label="Email"
            type="email"
            fullWidth
            error={!!errors.email}
            helperText={errors.email?.message}
            disabled={isSubmitting}
          />
        </Grid>

        <Grid xs={12}>
          <TextField
            {...register('iban')}
            label="IBAN (opcional)"
            fullWidth
            error={!!errors.iban}
            helperText={errors.iban?.message}
            disabled={isSubmitting}
            placeholder="ES00 0000 0000 0000 0000 0000"
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
