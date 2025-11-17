import { useState } from 'react';
import { Box, Button, FormControl, InputLabel, Select, MenuItem, Typography, CircularProgress, Stack } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { clientsApi } from '@/api/clients.api';

interface Step2ClientSelectProps {
  initialValue?: number;
  onNext: (clientId: number) => void;
  onBack: () => void;
}

export const Step2ClientSelect: React.FC<Step2ClientSelectProps> = ({
  initialValue,
  onNext,
  onBack,
}) => {
  const [selectedClientId, setSelectedClientId] = useState<number | ''>(initialValue || '');

  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsApi.list(),
  });

  const handleNext = () => {
    if (selectedClientId) {
      onNext(selectedClientId as number);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Paso 2: Selecciona el Cliente
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Selecciona el cliente que recibirá la factura
      </Typography>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <FormControl fullWidth sx={{ mb: 4 }}>
          <InputLabel>Cliente</InputLabel>
          <Select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value as number)}
            label="Cliente"
          >
            {clients?.map((client) => (
              <MenuItem key={client.id} value={client.id}>
                {client.name} ({client.taxId})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {selectedClientId && clients && (
        <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, mb: 3, border: 1, borderColor: 'divider' }}>
          {(() => {
            const client = clients.find((c) => c.id === selectedClientId);
            return client ? (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  <strong>{client.name}</strong>
                </Typography>
                <Typography variant="body2">CIF/NIF: {client.taxId}</Typography>
                <Typography variant="body2">Dirección: {client.address}</Typography>
                <Typography variant="body2">Email: {client.email}</Typography>
                {client.phone && <Typography variant="body2">Teléfono: {client.phone}</Typography>}
                {client.contactPerson && <Typography variant="body2">Contacto: {client.contactPerson}</Typography>}
              </>
            ) : null;
          })()}
        </Box>
      )}

      <Stack direction="row" spacing={2}>
        <Button variant="outlined" onClick={onBack}>
          Anterior
        </Button>
        <Button variant="contained" onClick={handleNext} disabled={!selectedClientId}>
          Siguiente
        </Button>
      </Stack>
    </Box>
  );
};
