import { Breadcrumbs as MuiBreadcrumbs, Link, Typography, Box } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { NavigateNext, Home } from '@mui/icons-material';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

const pathToLabel: Record<string, string> = {
  dashboard: 'Dashboard',
  invoices: 'Facturas',
  create: 'Crear',
  edit: 'Editar',
  companies: 'Empresas',
  clients: 'Clientes',
  users: 'Usuarios',
  profile: 'Perfil',
};

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Don't show breadcrumbs on public pages
  if (pathnames.includes('login') || pathnames.includes('register')) {
    return null;
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Inicio', path: '/dashboard' },
  ];

  let currentPath = '';
  pathnames.forEach((segment, index) => {
    // Skip numeric IDs in breadcrumbs
    if (!isNaN(Number(segment))) {
      return;
    }

    currentPath += `/${segment}`;
    const label = pathToLabel[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

    breadcrumbs.push({
      label,
      path: index === pathnames.length - 1 ? undefined : currentPath,
    });
  });

  // Only show breadcrumbs if there's more than just "Inicio"
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <Box sx={{ mb: 2 }}>
      <MuiBreadcrumbs separator={<NavigateNext fontSize="small" />}>
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          if (isLast || !breadcrumb.path) {
            return (
              <Typography key={index} color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {index === 0 && <Home fontSize="small" />}
                {breadcrumb.label}
              </Typography>
            );
          }

          return (
            <Link
              key={index}
              component={RouterLink}
              to={breadcrumb.path}
              underline="hover"
              color="inherit"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              {index === 0 && <Home fontSize="small" />}
              {breadcrumb.label}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
};
