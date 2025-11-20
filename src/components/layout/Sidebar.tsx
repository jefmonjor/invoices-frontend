
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
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Receipt as InvoiceIcon,
  People as UsersIcon,
  Business as CompanyIcon,
  PersonOutline as ClientIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

const DRAWER_WIDTH = 240;

interface SidebarProps {
  mobileOpen: boolean;
  onDrawerToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onDrawerToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { hasRole } = useAuthStore();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      roles: ['ROLE_USER', 'ROLE_ADMIN'],
    },
    {
      title: 'Facturas',
      icon: <InvoiceIcon />,
      path: '/invoices',
      roles: ['ROLE_USER', 'ROLE_ADMIN'],
    },
    {
      title: 'Empresas',
      icon: <CompanyIcon />,
      path: '/companies',
      roles: ['ROLE_USER', 'ROLE_ADMIN'],
    },
    {
      title: 'Clientes',
      icon: <ClientIcon />,
      path: '/clients',
      roles: ['ROLE_USER', 'ROLE_ADMIN'],
    },
    {
      title: 'Usuarios',
      icon: <UsersIcon />,
      path: '/users',
      roles: ['ROLE_ADMIN'],
    },
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
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <InvoiceIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" noWrap component="div" color="primary">
            Invoices App
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => {
          // Check if user has required role
          const hasAccess = item.roles.some((role) => hasRole(role));
          if (!hasAccess) return null;

          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

          return (
            <ListItem key={item.title} disablePadding>
              <ListItemButton
                selected={isActive}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? 'primary.main' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.title} />
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
