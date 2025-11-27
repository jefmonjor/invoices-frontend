import { useState } from 'react';
import { Box, Button, FormControl, InputLabel, Select, MenuItem, Typography, CircularProgress, Stack } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { companiesApi } from '@/api/companies.api';
import { useTranslation } from 'react-i18next';

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

  const { t } = useTranslation(['invoices', 'common']);

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
        {t('invoices:wizard.step1.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('invoices:wizard.step1.subtitle')}
      </Typography>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <FormControl fullWidth sx={{ mb: 4 }}>
          <InputLabel>{t('invoices:wizard.step1.label')}</InputLabel>
          <Select
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value as number)}
            label={t('invoices:wizard.step1.label')}
          >
            {companies?.map((company) => (
              <MenuItem key={company.id} value={company.id}>
                {company.businessName} ({company.taxId})
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
                  <strong>{company.businessName}</strong>
                </Typography>
                <Typography variant="body2">CIF/NIF: {company.taxId}</Typography>
                <Typography variant="body2">{t('invoices:wizard.step1.address')} {company.address}</Typography>
                <Typography variant="body2">{t('invoices:wizard.step1.email')} {company.email}</Typography>
                {company.phone && <Typography variant="body2">{t('invoices:wizard.step1.phone')} {company.phone}</Typography>}
              </>
            ) : null;
          })()}
        </Box>
      )}

      <Stack direction="row" spacing={2}>
        <Button variant="outlined" onClick={onCancel}>
          {t('common:actions.cancel')}
        </Button>
        <Button variant="contained" onClick={handleNext} disabled={!selectedCompanyId}>
          {t('common:actions.next', 'Siguiente')}
        </Button>
      </Stack>
    </Box>
  );
};
