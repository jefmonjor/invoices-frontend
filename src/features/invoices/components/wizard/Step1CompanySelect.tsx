import { useState } from 'react';
import { Box, Button, FormControl, InputLabel, Select, MenuItem, Typography, CircularProgress, Stack } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { companiesApi } from '@/api/companies.api';

interface Step1CompanySelectProps {
  initialValue?: number;
  onNext: (companyId: number) => void;
  onCancel: () => void;
}

export const Step1CompanySelect: React.FC<Step1CompanySelectProps> = ({
  initialValue,
  onNext,
  onCancel,
}) => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | ''>(initialValue || '');

  const { data: companies, isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: () => companiesApi.list(),
  });

  const handleNext = () => {
    if (selectedCompanyId) {
      onNext(selectedCompanyId as number);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Paso 1: Selecciona la Empresa Emisora
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Selecciona la empresa que emitirá la factura
      </Typography>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <FormControl fullWidth sx={{ mb: 4 }}>
          <InputLabel>Empresa</InputLabel>
          <Select
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value as number)}
            label="Empresa"
          >
            {companies?.map((company) => (
              <MenuItem key={company.id} value={company.id}>
                {company.name} ({company.taxId})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {selectedCompanyId && companies && (
        <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, mb: 3, border: 1, borderColor: 'divider' }}>
          {(() => {
            const company = companies.find((c) => c.id === selectedCompanyId);
            return company ? (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  <strong>{company.name}</strong>
                </Typography>
                <Typography variant="body2">CIF/NIF: {company.taxId}</Typography>
                <Typography variant="body2">Dirección: {company.address}</Typography>
                <Typography variant="body2">Email: {company.email}</Typography>
                {company.phone && <Typography variant="body2">Teléfono: {company.phone}</Typography>}
              </>
            ) : null;
          })()}
        </Box>
      )}

      <Stack direction="row" spacing={2}>
        <Button variant="outlined" onClick={onCancel}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleNext} disabled={!selectedCompanyId}>
          Siguiente
        </Button>
      </Stack>
    </Box>
  );
};
