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
import type { Company } from '@/types/company.types';
import { formatDate } from '@/utils/formatters';

interface CompaniesTableProps {
  companies: Company[];
  onView?: (company: Company) => void;
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
}

export const CompaniesTable: React.FC<CompaniesTableProps> = ({
  companies,
  onView,
  onEdit,
  onDelete,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const renderActions = (company: Company) => (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {onView && (
        <Tooltip title="Ver detalles">
          <IconButton size="small" onClick={() => onView(company)} color="primary">
            <ViewIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title="Editar">
        <IconButton size="small" onClick={() => onEdit(company)} color="primary">
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Eliminar">
        <IconButton size="small" onClick={() => onDelete(company)} color="error">
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );

  if (isMobile) {
    return (
      <Stack spacing={2}>
        {companies.length === 0 ? (
          <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
            No hay empresas registradas
          </Typography>
        ) : (
          companies.map((company) => (
            <Card key={company.id}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" component="div">
                      {company.businessName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {company.taxId}
                    </Typography>
                  </Box>
                  {company.createdAt && (
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(company.createdAt)}
                    </Typography>
                  )}
                </Box>

                <Divider sx={{ my: 1.5 }} />

                <Stack spacing={1} sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Email
                    </Typography>
                    <Typography variant="body2">{company.email}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Teléfono
                    </Typography>
                    <Typography variant="body2">{company.phone || '-'}</Typography>
                  </Box>
                </Stack>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
                  {renderActions(company)}
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
            <TableCell>Nombre</TableCell>
            <TableCell>CIF/NIF</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Teléfono</TableCell>
            <TableCell>Fecha Creación</TableCell>
            <TableCell align="center">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {companies.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center">
                No hay empresas registradas
              </TableCell>
            </TableRow>
          ) : (
            companies.map((company) => (
              <TableRow key={company.id} hover>
                <TableCell>{company.businessName}</TableCell>
                <TableCell>{company.taxId}</TableCell>
                <TableCell>{company.email}</TableCell>
                <TableCell>{company.phone || '-'}</TableCell>
                <TableCell>{company.createdAt ? formatDate(company.createdAt) : "-"}</TableCell>
                <TableCell align="center">
                  {renderActions(company)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
