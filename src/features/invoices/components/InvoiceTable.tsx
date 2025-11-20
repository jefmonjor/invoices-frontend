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
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Número</TableCell>
            <TableCell>Fecha</TableCell>
            <TableCell align="right">Base Imponible</TableCell>
            <TableCell align="right">IVA</TableCell>
            <TableCell align="right">IRPF</TableCell>
            <TableCell align="right">RE</TableCell>
            <TableCell align="right">Total</TableCell>
            <TableCell align="right">Acciones</TableCell>
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
              <TableCell align="right">
                <Tooltip title="Ver detalle">
                  <IconButton size="small" onClick={() => onView(invoice)} color="primary">
                    <ViewIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Editar">
                  <IconButton size="small" onClick={() => onEdit(invoice)} color="info">
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Descargar PDF">
                  <IconButton size="small" onClick={() => onDownloadPDF(invoice)} color="secondary">
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Eliminar">
                  <IconButton size="small" onClick={() => onDelete(invoice)} color="error">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
