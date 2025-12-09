import { useState } from 'react';
import { Box, Toolbar, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Sidebar, DRAWER_WIDTH_EXPORT } from './Sidebar';
import { Header } from './Header';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { CommandPalette } from '@/components/common/CommandPalette';

export const MainLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Header onDrawerToggle={handleDrawerToggle} drawerWidth={DRAWER_WIDTH_EXPORT} />
      <Sidebar mobileOpen={mobileOpen} onDrawerToggle={handleDrawerToggle} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          // Responsive padding: smaller on mobile
          p: { xs: 1.5, sm: 2, md: 3 },
          width: { md: `calc(100% - ${DRAWER_WIDTH_EXPORT}px)` },
          // Dynamic viewport height for mobile, fallback to 100vh
          minHeight: { xs: '100dvh', md: '100vh' },
          backgroundColor: 'background.default',
          // Safe area for bottom gesture bar on mobile
          pb: { xs: 'calc(16px + env(safe-area-inset-bottom, 0px))', md: 3 },
        }}
      >
        <Toolbar /> {/* Spacer for fixed AppBar */}
        <Container
          maxWidth={false}
          sx={{
            mt: { xs: 1, md: 2 },
            // Responsive horizontal padding
            px: { xs: 1, sm: 2, md: 4, lg: 6 }
          }}
        >
          <Breadcrumbs />
          <Outlet />
        </Container>
      </Box>
      <CommandPalette />
    </Box>
  );
};
