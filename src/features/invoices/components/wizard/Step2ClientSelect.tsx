import { useState } from 'react';
import { Box, Button, FormControl, InputLabel, Select, MenuItem, Typography, CircularProgress, Stack } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { clientsApi } from '@/api/clients.api';
import { useTranslation } from 'react-i18next';

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

  const { t } = useTranslation(['invoices', 'common']);

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
        {t('invoices:wizard.step2.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('invoices:wizard.step2.subtitle')}
      </Typography>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <FormControl fullWidth sx={{ mb: 4 }}>
          <InputLabel>{t('invoices:wizard.step2.label')}</InputLabel>
          <Select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value as number)}
            label={t('invoices:wizard.step2.label')}
          >
            {clients?.map((client) => (
              <MenuItem key={client.id} value={client.id}>
                {client.businessName} ({client.taxId})
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
                  <strong>{client.businessName}</strong>
                </Typography>
                <Typography variant="body2">CIF/NIF: {client.taxId}</Typography>
                {client.address && (
                  <Typography variant="body2">
                    {t('invoices:wizard.step2.address')} {client.address}
                    {client.city && `, ${client.city}`}
                    {client.postalCode && ` (${client.postalCode})`}
                  </Typography>
                )}
                {client.email && <Typography variant="body2">{t('invoices:wizard.step2.email')} {client.email}</Typography>}
                {client.phone && <Typography variant="body2">{t('invoices:wizard.step2.phone')} {client.phone}</Typography>}
              </>
            ) : null;
          })()}
        </Box>
      )}

      <Stack direction="row" spacing={2}>
        <Button variant="outlined" onClick={onBack}>
          {t('common:actions.back')}
        </Button>
        <Button variant="contained" onClick={handleNext} disabled={!selectedClientId}>
          {t('common:actions.next', 'Siguiente')}
        </Button>
      </Stack>
    </Box>
  );
};
