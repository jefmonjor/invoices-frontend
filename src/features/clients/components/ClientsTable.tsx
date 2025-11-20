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

interface ClientsTableProps {
  clients: Client[];
  onView?: (client: Client) => void;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

export const ClientsTable: React.FC<ClientsTableProps> = ({
  clients,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>CIF/NIF</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Teléfono</TableCell>
            <TableCell>Fecha Creación</TableCell>
            <TableCell align="center">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {clients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center">
                No hay clientes registrados
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
                    <Tooltip title="Ver detalles">
                      <IconButton size="small" onClick={() => onView(client)} color="primary">
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Editar">
                    <IconButton size="small" onClick={() => onEdit(client)} color="primary">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton size="small" onClick={() => onDelete(client)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
