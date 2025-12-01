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
  useTheme,
  useMediaQuery,
  Stack,
  Card,
  CardContent,
  Box,
  Typography,
  Divider,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const renderActions = (client: Client) => (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {onView && (
        <Tooltip title={t('clients:actions.view')}>
          <IconButton size="small" onClick={() => onView(client)} color="primary">
            <ViewIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title={t('clients:actions.edit')}>
        <IconButton size="small" onClick={() => onEdit(client)} color="primary">
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      {canDelete && (
        <Tooltip title={t('clients:actions.delete')}>
          <IconButton size="small" onClick={() => onDelete(client)} color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );

  if (isMobile) {
    return (
      <Stack spacing={2}>
        {clients.length === 0 ? (
          <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
            {t('clients:table.empty')}
          </Typography>
        ) : (
          clients.map((client) => (
            <Card key={client.id}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" component="div">
                      {client.businessName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {client.taxId}
                    </Typography>
                  </Box>
                  {client.createdAt && (
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(client.createdAt)}
                    </Typography>
                  )}
                </Box>

                <Divider sx={{ my: 1.5 }} />

                <Stack spacing={1} sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {t('clients:table.email')}
                    </Typography>
                    <Typography variant="body2">{client.email}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {t('clients:table.phone')}
                    </Typography>
                    <Typography variant="body2">{client.phone || '-'}</Typography>
                  </Box>
                </Stack>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
                  {renderActions(client)}
                </Box>
              </CardContent>
            </Card>
          ))
        )}
      </Stack>
    );
  }

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
                  {renderActions(client)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
