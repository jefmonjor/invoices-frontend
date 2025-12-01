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
  Chip,
  Box,
  useTheme,
  useMediaQuery,
  Stack,
  Card,
  CardContent,
  Typography,
  Divider,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { User } from '@/types/user.types';
import { formatDate } from '@/utils/formatters';

interface UsersTableProps {
  users: User[];
  isAdmin: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  isAdmin,
  onEdit,
  onDelete,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const renderActions = (user: User) => (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Tooltip title="Editar">
        <IconButton size="small" onClick={() => onEdit(user)} color="primary">
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Eliminar">
        <IconButton size="small" onClick={() => onDelete(user)} color="error">
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );

  const renderRoles = (roles: string[]) => (
    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
      {roles.map((role) => (
        <Chip
          key={role}
          label={role.replace('ROLE_', '')}
          size="small"
          color={role === 'ROLE_ADMIN' ? 'error' : 'default'}
        />
      ))}
    </Box>
  );

  if (isMobile) {
    return (
      <Stack spacing={2}>
        {users.length === 0 ? (
          <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
            No hay usuarios registrados
          </Typography>
        ) : (
          users.map((user) => (
            <Card key={user.id}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" component="div">
                      {user.firstName} {user.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                  <Chip
                    label={user.enabled ? 'Activo' : 'Inactivo'}
                    size="small"
                    color={user.enabled ? 'success' : 'default'}
                  />
                </Box>

                <Divider sx={{ my: 1.5 }} />

                <Stack spacing={1} sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Roles
                    </Typography>
                    {renderRoles(user.roles)}
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Fecha Creación
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(user.createdAt)}
                    </Typography>
                  </Box>
                </Stack>

                {isAdmin && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
                    {renderActions(user)}
                  </Box>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </Stack>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table sx={{ '& .MuiTableCell-root': { py: 2 } }}>
        <TableHead>
          <TableRow>
            <TableCell>Email</TableCell>
            <TableCell>Nombre</TableCell>
            <TableCell>Apellido</TableCell>
            <TableCell>Roles</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Fecha Creación</TableCell>
            {isAdmin && <TableCell align="center">Acciones</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={isAdmin ? 7 : 6} align="center">
                No hay usuarios registrados
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.firstName}</TableCell>
                <TableCell>{user.lastName}</TableCell>
                <TableCell>
                  {renderRoles(user.roles)}
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.enabled ? 'Activo' : 'Inactivo'}
                    size="small"
                    color={user.enabled ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
                {isAdmin && (
                  <TableCell align="center">
                    {renderActions(user)}
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
