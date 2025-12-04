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
    quantity: 1,
    unitPrice: 0,
    taxRate: 21, // Default IVA in Spain
    discountPercentage: 0,
    // Campos opcionales para facturas de transporte
    itemDate: '',
    vehiclePlate: '',
    orderNumber: '',
    zone: '',
    gasPercentage: 0,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateItem = (item: InvoiceItem) => {
    const newErrors: { [key: string]: string } = {};

    if (!item.description.trim()) {
      newErrors.description = t('invoices:wizard.step4.errors.descriptionRequired');
    }
    if (item.quantity < 1) {
      newErrors.quantity = t('invoices:wizard.step4.errors.quantityMin');
    }
    if (item.unitPrice <= 0) {
      newErrors.unitPrice = t('invoices:wizard.step4.errors.unitPriceMin');
    }
    if (item.taxRate < 0 || item.taxRate > 100) {
      newErrors.taxRate = t('invoices:wizard.step4.errors.vatRange');
    }
    if ((item.discountPercentage || 0) < 0 || (item.discountPercentage || 0) > 100) {
      newErrors.discountPercentage = t('invoices:wizard.step4.errors.discountRange');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddItem = () => {
    if (validateItem(newItem)) {
      setItems([...items, { ...newItem }]);
      setNewItem({
        description: '',
        quantity: 1,
        unitPrice: 0,
        taxRate: 21,
        discountPercentage: 0,
        itemDate: '',
        vehiclePlate: '',
        orderNumber: '',
        zone: '',
        gasPercentage: 0,
      });
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
    const subtotal = item.quantity * item.unitPrice;
    const discount = subtotal * ((item.discountPercentage || 0) / 100);
    const subtotalAfterDiscount = subtotal - discount;
    const vat = subtotalAfterDiscount * (item.taxRate / 100);
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
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            {t('invoices:wizard.step4.newItem')}
          </Typography>
          <Grid container spacing={6}>
            <Grid item xs={12} sm={3}>
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
                helperText={errors.description}
                size="small"
              />
            </Grid>
            <Grid item xs={6} sm={1.5}>
              <TextField
                fullWidth
                type="number"
                label={t('invoices:wizard.step4.quantity')}
                value={newItem.quantity}
                onChange={(e) => {
                  setNewItem({ ...newItem, quantity: parseFloat(e.target.value) });
                  if (errors.quantity) setErrors({ ...errors, quantity: '' });
                }}
                error={!!errors.quantity}
                helperText={errors.quantity}
                size="small"
                inputProps={{ min: 1, step: 1 }}
              />
            </Grid>
            <Grid item xs={6} sm={1.5}>
              <TextField
                fullWidth
                type="number"
                label={t('invoices:wizard.step4.unitPrice')}
                value={newItem.unitPrice}
                onChange={(e) => {
                  setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) });
                  if (errors.unitPrice) setErrors({ ...errors, unitPrice: '' });
                }}
                error={!!errors.unitPrice}
                helperText={errors.unitPrice}
                size="small"
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={6} sm={1.5}>
              <TextField
                fullWidth
                type="number"
                label={t('invoices:wizard.step4.vat')}
                value={newItem.taxRate}
                onChange={(e) => {
                  setNewItem({ ...newItem, taxRate: parseFloat(e.target.value) });
                  if (errors.taxRate) setErrors({ ...errors, taxRate: '' });
                }}
                error={!!errors.taxRate}
                helperText={errors.taxRate}
                size="small"
                inputProps={{ min: 0, max: 100, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={6} sm={1.5}>
              <TextField
                fullWidth
                type="number"
                label={t('invoices:wizard.step4.discount')}
                value={newItem.discountPercentage}
                onChange={(e) => {
                  setNewItem({ ...newItem, discountPercentage: parseFloat(e.target.value) });
                  if (errors.discountPercentage) setErrors({ ...errors, discountPercentage: '' });
                }}
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
                {t('invoices:wizard.step4.add')}
              </Button>
            </Grid>

            {/* Campos opcionales para facturas de transporte */}
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                {t('invoices:wizard.step4.optionalFields')}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                type="date"
                label={t('invoices:wizard.step4.date')}
                value={newItem.itemDate}
                onChange={(e) => setNewItem({ ...newItem, itemDate: e.target.value })}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                label={t('invoices:wizard.step4.plate')}
                value={newItem.vehiclePlate}
                onChange={(e) => setNewItem({ ...newItem, vehiclePlate: e.target.value })}
                size="small"
                placeholder="4592JBZ"
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                label={t('invoices:wizard.step4.order')}
                value={newItem.orderNumber}
                onChange={(e) => setNewItem({ ...newItem, orderNumber: e.target.value })}
                size="small"
                placeholder="PED-001"
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                label={t('invoices:wizard.step4.zone')}
                value={newItem.zone}
                onChange={(e) => setNewItem({ ...newItem, zone: e.target.value })}
                size="small"
                placeholder="CDF 11"
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                type="number"
                label={t('invoices:wizard.step4.gas')}
                value={newItem.gasPercentage}
                onChange={(e) => setNewItem({ ...newItem, gasPercentage: parseFloat(e.target.value) })}
                size="small"
                inputProps={{ min: 0, max: 100, step: 0.01 }}
              />
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
                <TableCell>{t('invoices:wizard.step4.table.description')}</TableCell>
                <TableCell align="right">{t('invoices:wizard.step4.table.quantity')}</TableCell>
                <TableCell align="right">{t('invoices:wizard.step4.table.unitPrice')}</TableCell>
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
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">€{item.unitPrice.toFixed(2)}</TableCell>
                  <TableCell align="right">{item.taxRate}%</TableCell>
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
