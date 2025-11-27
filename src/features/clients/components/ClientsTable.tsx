import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon } from '@mui/icons-material';
import type { Client } from '@/types/client.types';
import { formatDate } from '@/utils/formatters';
import { useTranslation } from 'react-i18next';

interface ClientsTableProps {
  clients: Client[];
  onView?: (client: Client) => void;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  canDelete?: boolean;
}

export const ClientsTable: React.FC<ClientsTableProps> = ({
  clients,
  onView,
  onEdit,
  onDelete,
  canDelete = true,
}) => {
  const { t } = useTranslation(['clients', 'common']);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('clients:table.name')}</TableCell>
            <TableCell>{t('clients:table.taxId')}</TableCell>
            <TableCell>{t('clients:table.email')}</TableCell>
            <TableCell>{t('clients:table.phone')}</TableCell>
            <TableCell>{t('clients:table.createdAt')}</TableCell>
            <TableCell align="center">{t('clients:table.actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {clients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center">
                {t('clients:table.empty')}
              </TableCell>
            </TableRow>
          ) : (
            clients.map((client) => (
              <TableRow key={client.id} hover>
                <TableCell>{client.businessName}</TableCell>
                <TableCell>{client.taxId}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.phone || '-'}</TableCell>
                <TableCell>{client.createdAt ? formatDate(client.createdAt) : "-"}</TableCell>
                <TableCell align="center">
                  {onView && (
                    <Tooltip title={t('clients:actions.view')}>
                      <IconButton size="small" onClick={() => onView(client)} color="primary">
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title={t('clients:actions.edit')}>
                    <IconButton size="small" onClick={() => onEdit(client)} color="primary">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  {canDelete && (
                    <Tooltip title={t('clients:actions.delete')}>
                      <IconButton size="small" onClick={() => onDelete(client)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
