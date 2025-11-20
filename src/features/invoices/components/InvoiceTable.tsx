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
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { Invoice } from '@/types/invoice.types';

interface InvoiceTableProps {
  invoices: Invoice[];
  onView: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
  onDownloadPDF: (invoice: Invoice) => void;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  onView,
  onEdit,
  onDelete,
  onDownloadPDF,
}) => {
  const canEdit = (invoice: Invoice) => {
    return invoice.status === 'DRAFT' || invoice.status === 'PENDING';
  };

  const canDelete = (invoice: Invoice) => {
    return invoice.status === 'DRAFT';
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Número</TableCell>
            <TableCell>Fecha</TableCell>
            <TableCell align="right">Subtotal</TableCell>
            <TableCell align="right">IVA</TableCell>
            <TableCell align="right">IRPF</TableCell>
            <TableCell align="right">RE</TableCell>
            <TableCell align="right">Total</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell align="right">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow
              key={invoice.id}
              hover
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                <strong>{invoice.invoiceNumber}</strong>
              </TableCell>
              <TableCell>{formatDate(invoice.date)}</TableCell>
              <TableCell align="right">{formatCurrency(invoice.subtotal)}</TableCell>
              <TableCell align="right">{formatCurrency(invoice.totalVAT)}</TableCell>
              <TableCell align="right">{formatCurrency(invoice.totalIRPF || 0)}</TableCell>
              <TableCell align="right">{formatCurrency(invoice.totalRE || 0)}</TableCell>
              <TableCell align="right">
                <strong>{formatCurrency(invoice.total)}</strong>
              </TableCell>
              <TableCell>
                <StatusBadge status={invoice.status} />
              </TableCell>
              <TableCell align="right">
                <Tooltip title="Ver detalle">
                  <IconButton size="small" onClick={() => onView(invoice)} color="primary">
                    <ViewIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                {canEdit(invoice) && (
                  <Tooltip title="Editar">
                    <IconButton size="small" onClick={() => onEdit(invoice)} color="info">
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}

                <Tooltip title="Descargar PDF">
                  <IconButton size="small" onClick={() => onDownloadPDF(invoice)} color="secondary">
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                {canDelete(invoice) && (
                  <Tooltip title="Eliminar">
                    <IconButton size="small" onClick={() => onDelete(invoice)} color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
