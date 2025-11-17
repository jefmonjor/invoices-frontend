import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">
          Dashboard
        </Typography>
        <Button variant="outlined" color="error" onClick={handleLogout}>
          Cerrar Sesión
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Bienvenido, {user?.firstName} {user?.lastName}!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Email: {user?.email}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Roles: {user?.roles.join(', ')}
          </Typography>
        </CardContent>
      </Card>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          Sistema de Gestión de Facturas
        </Typography>
        <Typography variant="body1">
          ✅ Backend Spring Boot 3 + Java 21<br />
          ✅ Frontend React 18 + TypeScript + Vite<br />
          ✅ Material-UI + Zustand + React Query<br />
          ✅ Autenticación JWT<br />
          ✅ API REST completamente funcional<br />
        </Typography>
      </Box>
    </Box>
  );
};
