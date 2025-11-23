import React, { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Typography,
  Divider,
  Chip,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Business as BusinessIcon,
  KeyboardArrowDown as ArrowDownIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useCompanyContext } from '@/contexts/CompanyContext';

/**
 * CompanySelector Component
 *
 * Dropdown selector para cambiar entre empresas del usuario
 * Se muestra en el Navbar/Header
 *
 * Features:
 * - Lista de empresas con indicador de empresa actual
 * - Muestra: Nombre (CIF)
 * - Badge de rol (ADMIN/USER)
 * - Cambio de empresa con un click
 */
const CompanySelector: React.FC = () => {
  const { currentCompany, userCompanies, isLoading, error, switchCompany } = useCompanyContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectCompany = async (companyId: number) => {
    if (currentCompany?.id === companyId) {
      handleClose();
      return;
    }

    await switchCompany(companyId);
    handleClose();
  };

  // Estado de carga
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={20} />
        <Typography variant="body2" color="text.secondary">
          Cargando empresas...
        </Typography>
      </Box>
    );
  }

  // Estado de error
  if (error) {
    return (
      <Alert severity="error" sx={{ py: 0.5, px: 1 }}>
        {error}
      </Alert>
    );
  }

  // Sin empresa actual
  if (!currentCompany) {
    return (
      <Alert severity="warning" sx={{ py: 0.5, px: 1 }}>
        No hay empresa seleccionada
      </Alert>
    );
  }

  return (
    <Box>
      {/* Botón para abrir el dropdown */}
      <Button
        variant="outlined"
        onClick={handleClick}
        endIcon={<ArrowDownIcon />}
        startIcon={<BusinessIcon />}
        sx={{
          textTransform: 'none',
          borderColor: 'divider',
          color: 'text.primary',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover',
          },
        }}
      >
        <Box sx={{ textAlign: 'left' }}>
          <Typography variant="body2" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
            {currentCompany.businessName}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
            {currentCompany.taxId}
          </Typography>
        </Box>
      </Button>

      {/* Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            minWidth: 300,
            mt: 1,
          },
        }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="caption" color="text.secondary" fontWeight="bold">
            CAMBIAR EMPRESA
          </Typography>
        </Box>
        <Divider />

        {userCompanies.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              No tienes empresas asignadas
            </Typography>
          </MenuItem>
        ) : (
          userCompanies.map((userCompany) => {
            const isActive = userCompany.companyId === currentCompany.id;

            return (
              <MenuItem
                key={userCompany.companyId}
                onClick={() => handleSelectCompany(userCompany.companyId)}
                selected={isActive}
                sx={{
                  py: 1.5,
                  px: 2,
                  ...(isActive && {
                    bgcolor: 'action.selected',
                    '&:hover': {
                      bgcolor: 'action.selected',
                    },
                  }),
                }}
              >
                {/* Icono de check si es la empresa actual */}
                <ListItemIcon>
                  {isActive ? (
                    <CheckIcon color="primary" fontSize="small" />
                  ) : (
                    <BusinessIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  )}
                </ListItemIcon>

                {/* Información de la empresa */}
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight={isActive ? 'bold' : 'normal'}>
                        {userCompany.company.businessName}
                      </Typography>
                      <Chip
                        label={userCompany.role}
                        size="small"
                        color={userCompany.role === 'ADMIN' ? 'primary' : 'default'}
                        sx={{ height: 18, fontSize: '0.65rem' }}
                      />
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      CIF: {userCompany.company.taxId}
                    </Typography>
                  }
                />
              </MenuItem>
            );
          })
        )}

        <Divider sx={{ my: 1 }} />

        {/* Footer: Total de empresas */}
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {userCompanies.length} {userCompanies.length === 1 ? 'empresa' : 'empresas'} disponibles
          </Typography>
        </Box>
      </Menu>
    </Box>
  );
};

export default CompanySelector;
