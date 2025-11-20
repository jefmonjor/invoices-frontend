import { useState } from 'react';
import { Box, Button, TextField, Typography, Stack, Grid } from '@mui/material';
import { toISODate } from '@/utils/formatters';

interface Step3InvoiceDataProps {
  initialValues?: {
    invoiceNumber?: string;
    date?: string;
    irpfPercentage?: number;
    rePercentage?: number;
    notes?: string;
  };
  onNext: (data: {
    invoiceNumber: string;
    date: string;
    irpfPercentage?: number;
    rePercentage?: number;
    notes?: string;
  }) => void;
  onBack: () => void;
}

export const Step3InvoiceData: React.FC<Step3InvoiceDataProps> = ({
  initialValues,
  onNext,
  onBack,
}) => {
  const today = new Date();

  const [formData, setFormData] = useState({
    invoiceNumber: initialValues?.invoiceNumber || '',
    date: initialValues?.date || toISODate(today, true),
    irpfPercentage: initialValues?.irpfPercentage ?? 0,
    rePercentage: initialValues?.rePercentage ?? 0,
    notes: initialValues?.notes || '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.invoiceNumber.trim()) {
      newErrors.invoiceNumber = 'El número de factura es requerido';
    } else if (!/^[A-Za-z0-9.-]+$/.test(formData.invoiceNumber)) {
      newErrors.invoiceNumber = 'Solo letras, números, guiones y puntos';
    }

    if (!formData.date) {
      newErrors.date = 'La fecha es requerida';
    }

    if (formData.irpfPercentage < 0 || formData.irpfPercentage > 100) {
      newErrors.irpfPercentage = 'El IRPF debe estar entre 0% y 100%';
    }

    if (formData.rePercentage < 0 || formData.rePercentage > 100) {
      newErrors.rePercentage = 'El RE debe estar entre 0% y 100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext(formData);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Paso 3: Datos de la Factura
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Ingresa los datos de la factura
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Número de Factura"
            value={formData.invoiceNumber}
            onChange={(e) => handleChange('invoiceNumber', e.target.value)}
            error={!!errors.invoiceNumber}
            helperText={errors.invoiceNumber || 'Ejemplos: FacturaA057.pdf, 4592JBZ-SEP-25.pdf, INV-2025-001'}
            placeholder="FacturaA057.pdf"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="date"
            label="Fecha"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            error={!!errors.date}
            helperText={errors.date}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            type="number"
            label="IRPF %"
            value={formData.irpfPercentage}
            onChange={(e) => handleChange('irpfPercentage', e.target.value)}
            error={!!errors.irpfPercentage}
            helperText={errors.irpfPercentage || 'Retención de IRPF'}
            inputProps={{ min: 0, max: 100, step: 0.01 }}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            type="number"
            label="RE %"
            value={formData.rePercentage}
            onChange={(e) => handleChange('rePercentage', e.target.value)}
            error={!!errors.rePercentage}
            helperText={errors.rePercentage || 'Recargo de Equivalencia'}
            inputProps={{ min: 0, max: 100, step: 0.01 }}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Notas"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            helperText="Notas adicionales (opcional)"
            multiline
          />
        </Grid>
      </Grid>

      <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
        <Button variant="outlined" onClick={onBack}>
          Anterior
        </Button>
        <Button variant="contained" onClick={handleNext}>
          Siguiente
        </Button>
      </Stack>
    </Box>
  );
};
