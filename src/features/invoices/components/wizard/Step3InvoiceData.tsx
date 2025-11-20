import { useState } from 'react';
import { Box, Button, TextField, Typography, Stack, Grid, IconButton, Tooltip } from '@mui/material';
import { AutoFixHigh as AutoGenerateIcon } from '@mui/icons-material';
import { toISODate } from '@/utils/formatters';
import { generateInvoiceNumber } from '@/utils/invoiceNumberGenerator';

interface Step3InvoiceDataProps {
  initialValues?: {
    invoiceNumber?: string;
    settlementNumber?: string;
    date?: string;
    irpfPercentage?: number;
    rePercentage?: number;
    notes?: string;
  };
  onNext: (data: {
    invoiceNumber: string;
    settlementNumber?: string;
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
    settlementNumber: initialValues?.settlementNumber || '',
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
    } else if (!/^[A-Za-z0-9.\/-]+$/.test(formData.invoiceNumber)) {
      newErrors.invoiceNumber = 'Solo letras, números, guiones, puntos y barras';
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

  const handleGenerateInvoiceNumber = () => {
    // Generar número de factura con prefijo vacío por defecto
    const generated = generateInvoiceNumber();
    setFormData((prev) => ({ ...prev, invoiceNumber: generated }));
    // Limpiar error si existe
    if (errors.invoiceNumber) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.invoiceNumber;
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
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <TextField
              fullWidth
              label="Número de Factura"
              value={formData.invoiceNumber}
              onChange={(e) => handleChange('invoiceNumber', e.target.value)}
              error={!!errors.invoiceNumber}
              helperText={errors.invoiceNumber || 'Ejemplos: A057/2025, 047/2025, FacturaA057.pdf'}
              placeholder="A057/2025"
            />
            <Tooltip title="Generar automáticamente">
              <IconButton
                color="primary"
                onClick={handleGenerateInvoiceNumber}
                sx={{ mt: 1 }}
              >
                <AutoGenerateIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Número de Liquidación (Opcional)"
            value={formData.settlementNumber}
            onChange={(e) => handleChange('settlementNumber', e.target.value)}
            helperText="Para facturas de transporte"
            placeholder="LIQ-001"
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
