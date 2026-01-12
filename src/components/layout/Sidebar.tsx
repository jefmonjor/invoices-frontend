
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Receipt as InvoiceIcon,
  People as UsersIcon,
  Business as CompanyIcon,
  PersonOutline as ClientIcon,
  // Security as SecurityIcon, // VERIFACTU DISABLED
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import CompanySelector from '../common/CompanySelector';
import { useTranslation } from 'react-i18next';
import { useCurrentCompany } from '@/contexts/useCompanyContext';

const DRAWER_WIDTH = 240;

interface SidebarProps {
  mobileOpen: boolean;
  onDrawerToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onDrawerToggle }) => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { hasRole } = useAuthStore();
  const currentCompany = useCurrentCompany();

  const menuItems = [
    {
      title: t('navigation.dashboard'),
      icon: <DashboardIcon />,
      path: '/dashboard',
      roles: ['ROLE_USER', 'ROLE_ADMIN'], // PLATFORM_ADMIN cannot access - company-specific
    },
    {
      title: t('navigation.invoices'),
      icon: <InvoiceIcon />,
      path: '/invoices',
      roles: ['ROLE_USER', 'ROLE_ADMIN'], // PLATFORM_ADMIN cannot access - company-specific
    },
    {
      title: t('navigation.companies'),
      icon: <CompanyIcon />,
      path: '/companies',
      roles: ['ROLE_USER', 'ROLE_ADMIN', 'ROLE_PLATFORM_ADMIN'], // Platform admin can manage companies
    },
    {
      title: t('navigation.clients'),
      icon: <ClientIcon />,
      path: '/clients',
      roles: ['ROLE_USER', 'ROLE_ADMIN'], // PLATFORM_ADMIN cannot access - company-specific
    },
    {
      title: t('navigation.users'),
      icon: <UsersIcon />,
      path: '/users',
      roles: ['ROLE_PLATFORM_ADMIN', 'ROLE_ADMIN'], // Platform and company admins
    },
    // VERIFACTU DISABLED TEMPORARILY
    // {
    //   title: 'Certificado VeriFactu',
    //   icon: <SecurityIcon />,
    //   path: '/settings/certificate',
    //   roles: ['ROLE_ADMIN'], // Only company admins
    // },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      onDrawerToggle();
    }
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <InvoiceIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" noWrap component="div" color="primary">
              {t('app.title')}
            </Typography>
          </Box>
          {currentCompany && (
            <Typography variant="caption" color="text.secondary" noWrap sx={{ ml: 4 }}>
              {currentCompany.businessName}
            </Typography>
          )}
        </Box>
      </Toolbar>
      <Divider />
      <Box sx={{ mt: 2 }}>
        <CompanySelector />
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => {
          // Check if user has required role
          const hasAccess = item.roles.some((role) => hasRole(role));
          if (!hasAccess) return null;

          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

          return (
            <ListItem key={item.title} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={isActive}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  position: 'relative',
                  transition: 'all 0.2s ease-in-out',
                  '&.Mui-selected': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.15),
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: -8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      height: '60%',
                      width: 4,
                      borderRadius: '0 4px 4px 0',
                      backgroundColor: 'primary.main',
                    }
                  },
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.text.primary, 0.05),
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? 'primary.main' : 'text.secondary',
                    minWidth: 40
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.95rem'
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const DRAWER_WIDTH_EXPORT = DRAWER_WIDTH;
