import { Box, Typography, Card, CardContent, Avatar, Stack } from '@mui/material';
import { EmailOutlined } from '@mui/icons-material';
import { useAuthStore } from '@/store/authStore';

export const DashboardPage = () => {
  const { user } = useAuthStore();

  // Get initials from user name
  const getInitials = () => {
    if (!user) return '';
    const firstInitial = user.firstName?.charAt(0) || '';
    const lastInitial = user.lastName?.charAt(0) || '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  return (
    <Box
      sx={{
        p: 4,
        pt: 10, // Más espacio arriba para que no quede pegado, pero no en el centro absoluto
        display: 'flex',
        justifyContent: 'center', // Centrado horizontalmente
        alignItems: 'flex-start', // Alineado arriba (no en el medio vertical)
        minHeight: '100%',
      }}
    >
      <Card
        sx={{
          maxWidth: 600,
          width: '100%',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: 'translate(30%, -30%)',
          }
        }}
      >
        <CardContent sx={{ p: 5, position: 'relative', zIndex: 1 }}>
          {/* Avatar section */}
          <Stack alignItems="center" spacing={3} sx={{ mb: 4 }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                fontSize: '2.5rem',
                fontWeight: 600,
                border: '4px solid rgba(255,255,255,0.3)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
              }}
            >
              {getInitials()}
            </Avatar>

            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 0.5,
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  opacity: 0.9,
                  fontSize: '1.1rem',
                }}
              >
                Bienvenido al sistema
              </Typography>
            </Box>
          </Stack>

          {/* User info cards */}
          <Stack spacing={2}>
            {/* Email card */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2.5,
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.25)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }
              }}
            >
              <EmailOutlined sx={{ fontSize: 28, opacity: 0.9 }} />
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
                  Correo Electrónico
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {user?.email}
                </Typography>
              </Box>
            </Box>

            {/* Roles card - Comented for future use
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2.5,
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.25)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }
              }}
            >
              <AdminPanelSettingsOutlined sx={{ fontSize: 28, opacity: 0.9 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mb: 1 }}>
                  Roles del Usuario
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {user?.roles.map((role) => (
                    <Chip
                      key={role}
                      label={role}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.25)',
                        color: 'white',
                        fontWeight: 500,
                        border: '1px solid rgba(255,255,255,0.3)',
                        backdropFilter: 'blur(5px)',
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            </Box>
            */}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardPage;
