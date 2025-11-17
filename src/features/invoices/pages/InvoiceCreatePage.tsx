
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Card } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import { InvoiceWizard } from '../components/wizard/InvoiceWizard';


export const InvoiceCreatePage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/invoices');
  };

  const handleSuccess = (invoiceId: number) => {
    navigate(`/invoices/${invoiceId}`);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<BackIcon />} onClick={handleBack}>
          Volver
        </Button>
        <Typography variant="h4">Nueva Factura</Typography>
      </Box>

      {/* Wizard Card */}
      <Card sx={{ p: 3 }}>
        <InvoiceWizard onSuccess={handleSuccess} onCancel={handleBack} />
      </Card>
    </Box>
  );
};

export default InvoiceCreatePage;
