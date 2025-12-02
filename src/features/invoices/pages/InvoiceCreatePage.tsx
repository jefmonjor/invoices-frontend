import { lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Card, CircularProgress } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// Lazy load InvoiceWizard to reduce initial bundle size (1.5MB -> split into separate chunk)
const InvoiceWizard = lazy(() => import('../components/wizard/InvoiceWizard').then(module => ({ default: module.InvoiceWizard })));


export const InvoiceCreatePage: React.FC = () => {
  const { t } = useTranslation(['invoices', 'common']);
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/invoices');
  };

  const handleSuccess = (invoiceId: number) => {
    navigate(`/invoices/${invoiceId}`);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button startIcon={<BackIcon />} onClick={handleBack}>
          {t('common:actions.back')}
        </Button>
        <Typography variant="h4">{t('invoices:create')}</Typography>
      </Box>

      {/* Wizard Card */}
      <Card sx={{ p: 3 }}>
        <Suspense fallback={
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress />
          </Box>
        }>
          <InvoiceWizard onSuccess={handleSuccess} onCancel={handleBack} />
        </Suspense>
      </Card>
    </Box>
  );
};

export default InvoiceCreatePage;
