import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Paper,
  useTheme,
  useMediaQuery,
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Divider,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  ErrorOutline as ErrorIcon,
  HourglassEmpty as PendingIcon,
} from '@mui/icons-material';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { Invoice } from '@/types/invoice.types';
import { useTranslation } from 'react-i18next';
import VerifactuBadge from './VerifactuBadge';

interface InvoiceTableProps {
  invoices: Invoice[];
  onView: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
  onDownloadPDF: (invoice: Invoice) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  onView,
  onEdit,
  onDelete,
  onDownloadPDF,
  canEdit = true,
  canDelete = true,
}) => {
  const { t } = useTranslation(['invoices', 'common']);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const renderActions = (invoice: Invoice) => (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Tooltip title={t('invoices:detail')}>
        <IconButton size="small" onClick={() => onView(invoice)} color="primary">
          <ViewIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      {canEdit && (
        <Tooltip title={t('invoices:actions.edit')}>
          <IconButton size="small" onClick={() => onEdit(invoice)} color="primary">
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {canDelete && (
        <Tooltip title={t('invoices:actions.delete')}>
          <IconButton size="small" onClick={() => onDelete(invoice)} color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {/* PDF Download Logic */}
      {invoice.verifactuStatus === 'ACCEPTED' ? (
        <Tooltip title={t('invoices:actions.downloadPdf')}>
          <IconButton size="small" onClick={() => onDownloadPDF(invoice)} color="primary">
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ) : invoice.verifactuStatus === 'REJECTED' || invoice.verifactuStatus === 'ERROR' ? (
        <Tooltip title={invoice.verifactuError || t('invoices:errors.pdfGenerationFailed', 'Error al generar PDF')}>
          <span>
            <IconButton size="small" disabled color="error">
              <ErrorIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      ) : (
        <Tooltip title={t('invoices:status.generatingPdf', 'Generando PDF...')}>
          <span>
            <IconButton size="small" disabled color="warning">
              <PendingIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      )}
    </Box>
  );

  if (isMobile) {
    return (
      <Stack spacing={2}>
        {invoices.map((invoice) => (
          <Card key={invoice.id} sx={{ position: 'relative' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h6" component="div" gutterBottom>
                    {invoice.invoiceNumber}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(invoice.issueDate)}
                  </Typography>
                </Box>
                <VerifactuBadge
                  status={invoice.verifactuStatus}
                  txId={invoice.verifactuTxId}
                  errorMessage={invoice.verifactuError}
                />
              </Box>

              <Divider sx={{ my: 1.5 }} />

              <Stack spacing={1} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('invoices:fields.baseAmount')}
                  </Typography>
                  <Typography variant="body2">
                    {formatCurrency(invoice.baseAmount)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('invoices:fields.vat')} ({invoice.items[0]?.vatPercentage}%)
                  </Typography>
                  <Typography variant="body2">
                    {formatCurrency(invoice.totalAmount - invoice.baseAmount + invoice.irpfAmount - invoice.reAmount)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {t('invoices:fields.total')}
                  </Typography>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary">
                    {formatCurrency(invoice.totalAmount)}
                  </Typography>
                </Box>
              </Stack>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
                {renderActions(invoice)}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('invoices:fields.invoiceNumber')}</TableCell>
            <TableCell>{t('invoices:fields.issueDate')}</TableCell>
            <TableCell align="right">{t('invoices:fields.baseAmount')}</TableCell>
            <TableCell align="right">{t('invoices:fields.vat')}</TableCell>
            <TableCell align="right">{t('invoices:fields.irpf')}</TableCell>
            <TableCell align="right">{t('invoices:fields.re', 'RE')}</TableCell>
            <TableCell align="right">{t('invoices:fields.total')}</TableCell>
            <TableCell align="center">{t('invoices:fields.status')}</TableCell>
            <TableCell align="right">{t('common:actions.title', 'Acciones')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {invoices.map((invoice) => {
            // Calculate VAT: totalAmount = baseAmount + VAT - IRPF + RE
            const totalVAT = invoice.totalAmount - invoice.baseAmount + invoice.irpfAmount - invoice.reAmount;

            return (
              <TableRow
                key={invoice.id}
                hover
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  <strong>{invoice.invoiceNumber}</strong>
                </TableCell>
                <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                <TableCell align="right">{formatCurrency(invoice.baseAmount)}</TableCell>
                <TableCell align="right">{formatCurrency(totalVAT)}</TableCell>
                <TableCell align="right">{formatCurrency(invoice.irpfAmount)}</TableCell>
                <TableCell align="right">{formatCurrency(invoice.reAmount)}</TableCell>
                <TableCell align="right">
                  <strong>{formatCurrency(invoice.totalAmount)}</strong>
                </TableCell>
                <TableCell align="center">
                  <VerifactuBadge
                    status={invoice.verifactuStatus}
                    txId={invoice.verifactuTxId}
                    errorMessage={invoice.verifactuError}
                  />
                </TableCell>
                <TableCell align="right">
                  {renderActions(invoice)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
