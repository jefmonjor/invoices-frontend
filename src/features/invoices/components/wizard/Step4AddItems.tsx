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
import { useTranslation } from 'react-i18next';

interface Step4AddItemsProps {
  initialItems?: InvoiceItem[];
  onNext: (items: InvoiceItem[]) => void;
  onBack: () => void;
}

/**
 * Parsea un valor decimal aceptando tanto coma como punto como separador.
 * Retorna el número parseado o el valor por defecto si no es válido.
 */
const parseDecimal = (value: string, defaultValue: number = 0): number => {
  if (!value || value === '') return defaultValue;
  // Reemplaza coma por punto para el parsing
  const normalized = value.replace(',', '.');
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? defaultValue : parsed;
};

export const Step4AddItems: React.FC<Step4AddItemsProps> = ({
  initialItems = [],
  onNext,
  onBack,
}) => {
  const { t } = useTranslation(['invoices', 'common']);

  const [items, setItems] = useState<InvoiceItem[]>(
    initialItems.length > 0 ? initialItems : []
  );

  const [newItem, setNewItem] = useState<InvoiceItem>({
    description: '',
    units: 1,
    price: 0,
    vatPercentage: 21, // Default IVA in Spain
    discountPercentage: 0,
    // Campos opcionales para facturas de transporte
    itemDate: '',
    vehiclePlate: '',
    orderNumber: '',
    zone: '',
    gasPercentage: 0,
  });

  // State para inputs de texto (para aceptar coma como separador decimal)
  const [priceInput, setPriceInput] = useState<string>('');
  const [discountInput, setDiscountInput] = useState<string>('0');
  const [gasInput, setGasInput] = useState<string>('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateItem = (item: InvoiceItem) => {
    const newErrors: { [key: string]: string } = {};

    if (!item.description.trim()) {
      newErrors.description = t('invoices:wizard.step4.errors.descriptionRequired');
    }
    if (item.units < 1) {
      newErrors.units = t('invoices:wizard.step4.errors.unitsMin');
    }
    if (item.price <= 0) {
      newErrors.price = t('invoices:wizard.step4.errors.priceMin');
    }
    if (item.vatPercentage < 0 || item.vatPercentage > 100) {
      newErrors.vatPercentage = t('invoices:wizard.step4.errors.vatRange');
    }
    if ((item.discountPercentage || 0) < 0 || (item.discountPercentage || 0) > 100) {
      newErrors.discountPercentage = t('invoices:wizard.step4.errors.discountRange');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddItem = () => {
    // Actualizar valores numéricos desde los inputs de texto
    const itemToAdd = {
      ...newItem,
      price: parseDecimal(priceInput, 0),
      discountPercentage: parseDecimal(discountInput, 0),
      gasPercentage: parseDecimal(gasInput, 0),
    };

    if (validateItem(itemToAdd)) {
      setItems([...items, { ...itemToAdd }]);
      setNewItem({
        description: '',
        units: 1,
        price: 0,
        vatPercentage: 21,
        discountPercentage: 0,
        itemDate: '',
        vehiclePlate: '',
        orderNumber: '',
        zone: '',
        gasPercentage: 0,
      });
      // Reset text inputs
      setPriceInput('');
      setDiscountInput('0');
      setGasInput('');
      setErrors({});
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  /**
   * Limpia los campos opcionales vacíos de los items antes de enviarlos al backend.
   * Convierte strings vacíos en undefined para campos opcionales de transporte.
   */
  const cleanItem = (item: InvoiceItem): InvoiceItem => {
    const cleaned = { ...item };
    // Si campos opcionales están vacíos, eliminarlos (undefined en lugar de "")
    if (!cleaned.itemDate || cleaned.itemDate.trim() === '') {
      delete cleaned.itemDate;
    }
    if (!cleaned.vehiclePlate || cleaned.vehiclePlate.trim() === '') {
      delete cleaned.vehiclePlate;
    }
    if (!cleaned.orderNumber || cleaned.orderNumber.trim() === '') {
      delete cleaned.orderNumber;
    }
    if (!cleaned.zone || cleaned.zone.trim() === '') {
      delete cleaned.zone;
    }
    if (cleaned.gasPercentage === 0 || cleaned.gasPercentage === undefined) {
      delete cleaned.gasPercentage;
    }
    return cleaned;
  };

  const handleNext = () => {
    if (items.length === 0) {
      setErrors({ items: t('invoices:wizard.step4.errors.noItems') });
      return;
    }
    // Limpiar items de campos vacíos antes de enviar
    const cleanedItems = items.map(cleanItem);
    onNext(cleanedItems);
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
        {t('invoices:wizard.step4.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('invoices:wizard.step4.subtitle')}
      </Typography>

      {/* Add Item Form */}
      <Card sx={{ mb: 3, p: 1 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom fontWeight="medium">
            {t('invoices:wizard.step4.newItem')}
          </Typography>

          {/* Main Fields Row */}
          <Grid container spacing={3} sx={{ mb: 2 }}>
            {/* Descripción - campo grande que ocupa toda la fila en móvil */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('invoices:wizard.step4.description')}
                value={newItem.description}
                onChange={(e) => {
                  setNewItem({ ...newItem, description: e.target.value });
                  if (errors.description) setErrors({ ...errors, description: '' });
                }}
                onBlur={() => {
                  if (!newItem.description.trim()) {
                    setErrors({ ...errors, description: t('invoices:wizard.step4.errors.descriptionRequired') });
                  }
                }}
                error={!!errors.description}
                helperText={errors.description || 'Describe el producto o servicio'}
                placeholder="Ej: Viaje Barcelona - Madrid, transporte de mercancías"
                multiline
                minRows={2}
              />
            </Grid>
          </Grid>
          {/* Numeric Fields Row - con más espacio */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                fullWidth
                type="number"
                label={t('invoices:wizard.step4.units')}
                value={newItem.units}
                onChange={(e) => {
                  setNewItem({ ...newItem, units: parseFloat(e.target.value) });
                  if (errors.units) setErrors({ ...errors, units: '' });
                }}
                error={!!errors.units}
                helperText={errors.units || 'Unidades'}
                inputProps={{ min: 1, step: 1 }}
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                fullWidth
                label={t('invoices:wizard.step4.price')}
                value={priceInput}
                onChange={(e) => {
                  // Acepta números, coma y punto
                  const val = e.target.value.replace(/[^0-9.,]/g, '');
                  setPriceInput(val);
                  if (errors.price) setErrors({ ...errors, price: '' });
                }}
                error={!!errors.price}
                helperText={errors.price || 'Precio/ud (€)'}
                placeholder="0,00"
                inputProps={{ inputMode: 'decimal' }}
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                fullWidth
                type="number"
                label={t('invoices:wizard.step4.vat')}
                value={newItem.vatPercentage}
                onChange={(e) => {
                  setNewItem({ ...newItem, vatPercentage: parseFloat(e.target.value) });
                  if (errors.vatPercentage) setErrors({ ...errors, vatPercentage: '' });
                }}
                error={!!errors.vatPercentage}
                helperText={errors.vatPercentage || 'IVA %'}
                inputProps={{ min: 0, max: 100, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                fullWidth
                label={t('invoices:wizard.step4.discount')}
                value={discountInput}
                onChange={(e) => {
                  // Acepta números, coma y punto
                  const val = e.target.value.replace(/[^0-9.,]/g, '');
                  setDiscountInput(val);
                  if (errors.discountPercentage) setErrors({ ...errors, discountPercentage: '' });
                }}
                error={!!errors.discountPercentage}
                helperText={errors.discountPercentage || 'Dto. %'}
                placeholder="0"
                inputProps={{ inputMode: 'decimal' }}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={4}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={handleAddItem}
                sx={{ height: 56, fontSize: '1rem' }}
              >
                {t('invoices:wizard.step4.add')}
              </Button>
            </Grid>
          </Grid>

          {/* Campos opcionales para facturas de transporte */}
          <Box sx={{
            mt: 2,
            pt: 2,
            borderTop: '1px dashed',
            borderColor: 'divider'
          }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
              📦 {t('invoices:wizard.step4.optionalFields')} (solo para transporte)
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={6} sm={4} md={2}>
                <TextField
                  fullWidth
                  type="date"
                  label={t('invoices:wizard.step4.date')}
                  value={newItem.itemDate}
                  onChange={(e) => setNewItem({ ...newItem, itemDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  helperText="Fecha servicio"
                />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <TextField
                  fullWidth
                  label={t('invoices:wizard.step4.plate')}
                  value={newItem.vehiclePlate}
                  onChange={(e) => setNewItem({ ...newItem, vehiclePlate: e.target.value })}
                  placeholder="4592JBZ"
                  helperText="Matrícula"
                />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <TextField
                  fullWidth
                  label={t('invoices:wizard.step4.order')}
                  value={newItem.orderNumber}
                  onChange={(e) => setNewItem({ ...newItem, orderNumber: e.target.value })}
                  placeholder="PED-001"
                  helperText="Nº Pedido"
                />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <TextField
                  fullWidth
                  label={t('invoices:wizard.step4.zone')}
                  value={newItem.zone}
                  onChange={(e) => setNewItem({ ...newItem, zone: e.target.value })}
                  placeholder="CDF 11"
                  helperText="Zona"
                />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <TextField
                  fullWidth
                  label={t('invoices:wizard.step4.gas')}
                  value={gasInput}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.,]/g, '');
                    setGasInput(val);
                  }}
                  placeholder="0"
                  inputProps={{ inputMode: 'decimal' }}
                  helperText="% Gasoil"
                />
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Items Table */}
      {items.length > 0 && (
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('invoices:wizard.step4.table.description')}</TableCell>
                <TableCell align="right">{t('invoices:wizard.step4.table.units')}</TableCell>
                <TableCell align="right">{t('invoices:wizard.step4.table.price')}</TableCell>
                <TableCell align="right">{t('invoices:wizard.step4.table.vat')}</TableCell>
                <TableCell align="right">{t('invoices:wizard.step4.table.discount')}</TableCell>
                <TableCell align="right">{t('invoices:wizard.step4.table.total')}</TableCell>
                <TableCell align="right">{t('invoices:wizard.step4.table.actions')}</TableCell>
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
          {t('invoices:wizard.step4.empty')}
        </Typography>
      )}

      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
        <Button variant="outlined" onClick={onBack}>
          {t('common:actions.back')}
        </Button>
        <Button variant="contained" onClick={handleNext} disabled={items.length === 0}>
          {t('common:actions.next', 'Siguiente')}
        </Button>
      </Stack>
    </Box>
  );
};
