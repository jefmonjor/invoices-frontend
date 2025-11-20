import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Chip,
} from '@mui/material';
import { ExpandMore, FilterList, Clear } from '@mui/icons-material';

export interface FilterValues {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  companyId?: number;
  clientId?: number;
}

interface AdvancedFiltersProps {
  onFilterChange: (filters: FilterValues) => void;
  onClear: () => void;
  companies?: Array<{id: number; businessName: string}>;
  clients?: Array<{id: number; businessName: string}>;
  showAmountFilter?: boolean;
  showDateFilter?: boolean;
  showStatusFilter?: boolean;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  onFilterChange,
  onClear,
  companies = [],
  clients = [],
  showAmountFilter = true,
  showDateFilter = true,
  showStatusFilter = true,
}) => {
  const [filters, setFilters] = useState<FilterValues>({});
  const [expanded, setExpanded] = useState(false);

  const handleChange = (field: keyof FilterValues, value: string | number) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClear = () => {
    setFilters({});
    onClear();
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
          <FilterList />
          <Typography>Filtros Avanzados</Typography>
          {activeFiltersCount > 0 && (
            <Chip label={`${activeFiltersCount} activos`} size="small" color="primary" />
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Búsqueda"
              value={filters.search || ''}
              onChange={(e) => handleChange('search', e.target.value)}
              placeholder="Buscar..."
            />
          </Grid>

          {showStatusFilter && (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Estado"
                value={filters.status || ''}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="DRAFT">Borrador</MenuItem>
                <MenuItem value="PENDING">Pendiente</MenuItem>
                <MenuItem value="PAID">Pagada</MenuItem>
                <MenuItem value="CANCELLED">Cancelada</MenuItem>
              </TextField>
            </Grid>
          )}

          {showDateFilter && (
            <>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Desde"
                  value={filters.dateFrom || ''}
                  onChange={(e) => handleChange('dateFrom', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Hasta"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleChange('dateTo', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </>
          )}

          {showAmountFilter && (
            <>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Monto mínimo"
                  value={filters.minAmount || ''}
                  onChange={(e) => handleChange('minAmount', Number(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Monto máximo"
                  value={filters.maxAmount || ''}
                  onChange={(e) => handleChange('maxAmount', Number(e.target.value))}
                />
              </Grid>
            </>
          )}

          {companies.length > 0 && (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Empresa"
                value={filters.companyId || ''}
                onChange={(e) => handleChange('companyId', Number(e.target.value))}
              >
                <MenuItem value="">Todas</MenuItem>
                {companies.map(company => (
                  <MenuItem key={company.id} value={company.id}>
                    {company.businessName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          )}

          {clients.length > 0 && (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Cliente"
                value={filters.clientId || ''}
                onChange={(e) => handleChange('clientId', Number(e.target.value))}
              >
                <MenuItem value="">Todos</MenuItem>
                {clients.map(client => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.businessName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          )}

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<Clear />}
                onClick={handleClear}
              >
                Limpiar
              </Button>
            </Box>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};
