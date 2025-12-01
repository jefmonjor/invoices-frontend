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
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH_EXPORT}px)` },
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Toolbar /> {/* Spacer for fixed AppBar */}
        <Container maxWidth={false} sx={{ mt: 2, px: { xs: 2, md: 4 } }}>
          <Breadcrumbs />
          <Outlet />
        </Container>
      </Box>
      <CommandPalette />
    </Box>
  );
};
