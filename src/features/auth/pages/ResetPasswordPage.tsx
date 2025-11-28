import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Card, CardContent, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material';
import axios from 'axios';
import { authApi } from '@/api/auth.api';

export const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);

    // Verify token on mount
    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setError('Token de restablecimiento no encontrado');
                setVerifying(false);
                return;
            }

            try {
                const response = await authApi.verifyResetToken(token);
                setTokenValid(response.valid);
                if (!response.valid) {
                    setError('El enlace de restablecimiento ha expirado o es inválido');
                }
            } catch (err) {
                setError('Error al verificar el token');
                setTokenValid(false);
            } finally {
                setVerifying(false);
            }
        };

        verifyToken();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        // Validate password length
        if (newPassword.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (!token) {
            setError('Token no encontrado');
            return;
        }

        setLoading(true);

        try {
            await authApi.resetPassword(token, newPassword);
            setSuccess(true);
            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.error || 'Error al restablecer la contraseña');
            } else {
                setError('Error al restablecer la contraseña');
            }
        } finally {
            setLoading(false);
        }
    };

    if (verifying) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    bgcolor: 'background.default',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                bgcolor: 'background.default',
            }}
        >
            <Card sx={{ maxWidth: 450, width: '100%', mx: 2 }}>
                <CardContent>
                    <Typography variant="h4" component="h1" gutterBottom align="center">
                        Invoices App
                    </Typography>
                    <Typography variant="h6" gutterBottom align="center">
                        Restablecer Contraseña
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom align="center" sx={{ mb: 3 }}>
                        Ingresa tu nueva contraseña
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            Contraseña restablecida exitosamente. Redirigiendo al inicio de sesión...
                        </Alert>
                    )}

                    {!tokenValid && !verifying && (
                        <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            onClick={() => navigate('/login')}
                            sx={{ mt: 2 }}
                        >
                            Volver al inicio de sesión
                        </Button>
                    )}

                    {tokenValid && !success && (
                        <form onSubmit={handleSubmit}>
                            <TextField
                                label="Nueva Contraseña"
                                type="password"
                                fullWidth
                                margin="normal"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                autoFocus
                                autoComplete="new-password"
                                disabled={loading}
                                helperText="Mínimo 6 caracteres"
                            />
                            <TextField
                                label="Confirmar Contraseña"
                                type="password"
                                fullWidth
                                margin="normal"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                                disabled={loading}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                size="large"
                                disabled={loading}
                                sx={{ mt: 2 }}
                            >
                                {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default ResetPasswordPage;
