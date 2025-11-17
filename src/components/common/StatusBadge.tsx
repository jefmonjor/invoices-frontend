import { Chip } from '@mui/material';
import { getStatusColor, formatInvoiceStatus } from '@/utils/formatters';

interface StatusBadgeProps {
  status: 'DRAFT' | 'PENDING' | 'PAID' | 'CANCELLED';
  size?: 'small' | 'medium';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'small' }) => {
  return (
    <Chip
      label={formatInvoiceStatus(status)}
      color={getStatusColor(status)}
      size={size}
      sx={{ fontWeight: 'medium' }}
    />
  );
};
