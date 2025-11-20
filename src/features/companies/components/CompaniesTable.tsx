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
                  {onView && (
                    <Tooltip title="Ver detalles">
                      <IconButton size="small" onClick={() => onView(company)} color="primary">
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Editar">
                    <IconButton size="small" onClick={() => onEdit(company)} color="primary">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton size="small" onClick={() => onDelete(company)} color="error">
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
