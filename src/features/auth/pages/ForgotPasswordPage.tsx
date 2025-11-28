import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, TextField, Button, Typography, Alert, Link } from '@mui/material';
import axios from 'axios';
import { authApi } from '@/api/auth.api';

export const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await authApi.forgotPassword(email);
            setSuccess(response.message);
            setEmail('');
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || 'Error al enviar el correo de recuperación');
            } else {
                setError('Error al enviar el correo de recuperación');
            }
        } finally {
            setLoading(false);
        }
    };

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
                        ¿Olvidaste tu contraseña?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom align="center" sx={{ mb: 3 }}>
                        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            {success}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Email"
                            type="email"
                            fullWidth
                            margin="normal"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoFocus
                            autoComplete="email"
                            placeholder="ejemplo@correo.com"
                            disabled={loading || !!success}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={loading || !!success}
                            sx={{ mt: 2 }}
                        >
                            {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                        </Button>

                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                <Link
                                    component="button"
                                    variant="body2"
                                    onClick={() => navigate('/login')}
                                    sx={{ cursor: 'pointer', fontWeight: 'medium' }}
                                    type="button"
                                >
                                    Volver al inicio de sesión
                                </Link>
                            </Typography>
                        </Box>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
};

export default ForgotPasswordPage;
