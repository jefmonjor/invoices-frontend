import { useState } from 'react';
import { Box, Button, TextField, Typography, Stack, Grid } from '@mui/material';
import { toISODate } from '@/utils/formatters';

interface Step3InvoiceDataProps {
  initialValues?: {
    invoiceNumber?: string;
    issueDate?: string;
    dueDate?: string;
  };
  onNext: (data: { invoiceNumber: string; issueDate: string; dueDate: string }) => void;
  onBack: () => void;
}

export const Step3InvoiceData: React.FC<Step3InvoiceDataProps> = ({
  initialValues,
  onNext,
  onBack,
}) => {
  const today = new Date();
  const oneMonthLater = new Date(today);
  oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

  const [formData, setFormData] = useState({
    invoiceNumber: initialValues?.invoiceNumber || '',
    issueDate: initialValues?.issueDate || toISODate(today, true),
    dueDate: initialValues?.dueDate || toISODate(oneMonthLater, true),
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.invoiceNumber.trim()) {
      newErrors.invoiceNumber = 'El número de factura es requerido';
    } else if (!/^[A-Z0-9-]+$/.test(formData.invoiceNumber)) {
      newErrors.invoiceNumber = 'Solo mayúsculas, números y guiones';
    }

    if (!formData.issueDate) {
      newErrors.issueDate = 'La fecha de emisión es requerida';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'La fecha de vencimiento es requerida';
    }

    if (formData.issueDate && formData.dueDate) {
      const issue = new Date(formData.issueDate);
      const due = new Date(formData.dueDate);
      if (due < issue) {
        newErrors.dueDate = 'La fecha de vencimiento debe ser posterior a la fecha de emisión';
      }
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
        Ingresa el número y las fechas de la factura
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Número de Factura"
            value={formData.invoiceNumber}
            onChange={(e) => handleChange('invoiceNumber', e.target.value.toUpperCase())}
            error={!!errors.invoiceNumber}
            helperText={errors.invoiceNumber || 'Formato: INV-2025-001 (solo mayúsculas, números y guiones)'}
            placeholder="INV-2025-001"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="date"
            label="Fecha de Emisión"
            value={formData.issueDate}
            onChange={(e) => handleChange('issueDate', e.target.value)}
            error={!!errors.issueDate}
            helperText={errors.issueDate}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="date"
            label="Fecha de Vencimiento"
            value={formData.dueDate}
            onChange={(e) => handleChange('dueDate', e.target.value)}
            error={!!errors.dueDate}
            helperText={errors.dueDate}
            InputLabelProps={{
              shrink: true,
            }}
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
