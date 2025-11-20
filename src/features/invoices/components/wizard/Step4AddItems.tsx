import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { InvoiceItem } from '@/types/invoice.types';

interface Step4AddItemsProps {
  initialItems?: InvoiceItem[];
  onNext: (items: InvoiceItem[]) => void;
  onBack: () => void;
}

export const Step4AddItems: React.FC<Step4AddItemsProps> = ({
  initialItems = [],
  onNext,
  onBack,
}) => {
  const [items, setItems] = useState<InvoiceItem[]>(
    initialItems.length > 0 ? initialItems : []
  );

  const [newItem, setNewItem] = useState<InvoiceItem>({
    description: '',
    units: 1,
    price: 0,
    vatPercentage: 21, // Default IVA in Spain
    discountPercentage: 0,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateItem = (item: InvoiceItem) => {
    const newErrors: { [key: string]: string } = {};

    if (!item.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }
    if (item.units < 1) {
      newErrors.units = 'Las unidades deben ser al menos 1';
    }
    if (item.price <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
    }
    if (item.vatPercentage < 0 || item.vatPercentage > 100) {
      newErrors.vatPercentage = 'El IVA debe estar entre 0% y 100%';
    }
    if ((item.discountPercentage || 0) < 0 || (item.discountPercentage || 0) > 100) {
      newErrors.discountPercentage = 'El descuento debe estar entre 0% y 100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddItem = () => {
    if (validateItem(newItem)) {
      setItems([...items, { ...newItem }]);
      setNewItem({
        description: '',
        units: 1,
        price: 0,
        vatPercentage: 21,
        discountPercentage: 0,
      });
      setErrors({});
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (items.length === 0) {
      setErrors({ items: 'Debes agregar al menos un ítem' });
      return;
    }
    onNext(items);
  };

  const calculateItemTotal = (item: InvoiceItem) => {
    const subtotal = item.units * item.price;
    const discount = subtotal * ((item.discountPercentage || 0) / 100);
    const subtotalAfterDiscount = subtotal - discount;
    const vat = subtotalAfterDiscount * (item.vatPercentage / 100);
    return subtotalAfterDiscount + vat;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Paso 4: Agregar Items
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Agrega los productos o servicios de la factura
      </Typography>

      {/* Add Item Form */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Nuevo Item
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Descripción"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                error={!!errors.description}
                helperText={errors.description}
                size="small"
              />
            </Grid>
            <Grid item xs={6} sm={1.5}>
              <TextField
                fullWidth
                type="number"
                label="Unidades"
                value={newItem.units}
                onChange={(e) => setNewItem({ ...newItem, units: parseFloat(e.target.value) })}
                error={!!errors.units}
                helperText={errors.units}
                size="small"
                inputProps={{ min: 1, step: 1 }}
              />
            </Grid>
            <Grid item xs={6} sm={1.5}>
              <TextField
                fullWidth
                type="number"
                label="Precio"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
                error={!!errors.price}
                helperText={errors.price}
                size="small"
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={6} sm={1.5}>
              <TextField
                fullWidth
                type="number"
                label="IVA %"
                value={newItem.vatPercentage}
                onChange={(e) => setNewItem({ ...newItem, vatPercentage: parseFloat(e.target.value) })}
                error={!!errors.vatPercentage}
                helperText={errors.vatPercentage}
                size="small"
                inputProps={{ min: 0, max: 100, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={6} sm={1.5}>
              <TextField
                fullWidth
                type="number"
                label="Desc. %"
                value={newItem.discountPercentage}
                onChange={(e) => setNewItem({ ...newItem, discountPercentage: parseFloat(e.target.value) })}
                error={!!errors.discountPercentage}
                helperText={errors.discountPercentage}
                size="small"
                inputProps={{ min: 0, max: 100, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddItem}
                sx={{ height: 40 }}
              >
                Agregar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Items Table */}
      {items.length > 0 && (
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Descripción</TableCell>
                <TableCell align="right">Unidades</TableCell>
                <TableCell align="right">Precio</TableCell>
                <TableCell align="right">IVA %</TableCell>
                <TableCell align="right">Desc. %</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell align="right">{item.units}</TableCell>
                  <TableCell align="right">€{item.price.toFixed(2)}</TableCell>
                  <TableCell align="right">{item.vatPercentage}%</TableCell>
                  <TableCell align="right">{item.discountPercentage}%</TableCell>
                  <TableCell align="right">
                    <strong>€{calculateItemTotal(item).toFixed(2)}</strong>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="error" onClick={() => handleRemoveItem(index)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {errors.items && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {errors.items}
        </Typography>
      )}

      {items.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center', py: 4 }}>
          No hay items agregados. Agrega al menos un item para continuar.
        </Typography>
      )}

      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
        <Button variant="outlined" onClick={onBack}>
          Anterior
        </Button>
        <Button variant="contained" onClick={handleNext} disabled={items.length === 0}>
          Siguiente
        </Button>
      </Stack>
    </Box>
  );
};
