import { useState, useCallback, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    TextField,
    Alert,
    CircularProgress,
    IconButton,
    InputAdornment,
    Paper,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Chip,
    Divider,
} from '@mui/material';
import {
    CloudUpload,
    Visibility,
    VisibilityOff,
    CheckCircle,
    Security,
    Info,
    Warning,
    Schedule,
    Error as ErrorIcon,
} from '@mui/icons-material';
import { verifactuApi, type CertificateStatus } from '@/api/verifactu.api';
import { useCompanyContext, useCurrentCompanyId } from '@/contexts/useCompanyContext';
import { toast } from 'react-toastify';

export const CertificateSettingsPage: React.FC = () => {
    const companyId = useCurrentCompanyId();
    const { currentCompany } = useCompanyContext();
    const [file, setFile] = useState<File | null>(null);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [certStatus, setCertStatus] = useState<CertificateStatus | null>(null);
    const [isLoadingStatus, setIsLoadingStatus] = useState(true);

    // Load certificate status on mount
    useEffect(() => {
        if (companyId) {
            loadCertificateStatus();
        }
    }, [companyId]);

    const loadCertificateStatus = async () => {
        if (!companyId) return;
        setIsLoadingStatus(true);
        try {
            const status = await verifactuApi.getCertificateStatus(companyId);
            setCertStatus(status);
        } catch {
            setCertStatus(null);
        } finally {
            setIsLoadingStatus(false);
        }
    };

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        setError(null);
        setSuccess(false);

        if (selectedFile) {
            const validExtensions = ['.p12', '.pfx'];
            const fileName = selectedFile.name.toLowerCase();
            const isValid = validExtensions.some(ext => fileName.endsWith(ext));

            if (!isValid) {
                setError('El archivo debe ser un certificado P12 o PFX');
                return;
            }

            if (selectedFile.size > 5 * 1024 * 1024) {
                setError('El archivo no puede superar 5MB');
                return;
            }

            setFile(selectedFile);
        }
    }, []);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!file || !password || !companyId) {
            setError('Selecciona un archivo y escribe la contraseña del certificado');
            return;
        }

        setIsUploading(true);
        setError(null);

        try {
            await verifactuApi.uploadCertificate(companyId, file, password);
            setSuccess(true);
            setFile(null);
            setPassword('');
            toast.success('Certificado subido correctamente');
            // Reload status
            await loadCertificateStatus();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Error al subir el certificado';
            setError(errorMessage);
            toast.error('Error al subir el certificado');
        } finally {
            setIsUploading(false);
        }
    };

    const getStatusChip = (status: CertificateStatus) => {
        switch (status.status) {
            case 'VALID':
                return <Chip icon={<CheckCircle />} label="Válido" color="success" />;
            case 'EXPIRING_SOON':
                return <Chip icon={<Schedule />} label={`Caduca en ${status.daysUntilExpiration} días`} color="warning" />;
            case 'EXPIRED':
                return <Chip icon={<ErrorIcon />} label="Caducado" color="error" />;
            default:
                return <Chip icon={<Warning />} label="No configurado" color="default" />;
        }
    };

    if (!companyId) {
        return (
            <Box>
                <Typography variant="h4" gutterBottom>
                    Certificado VeriFactu
                </Typography>
                <Alert severity="warning">
                    Debes seleccionar una empresa para configurar el certificado
                </Alert>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Certificado VeriFactu
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Sube tu certificado digital para firmar facturas según la normativa VeriFactu
            </Typography>

            {/* Current Certificate Status */}
            {isLoadingStatus ? (
                <Card sx={{ mb: 3 }}>
                    <CardContent sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                        <CircularProgress size={24} />
                    </CardContent>
                </Card>
            ) : certStatus?.configured ? (
                <Card sx={{ mb: 3, borderLeft: 4, borderColor: certStatus.status === 'VALID' ? 'success.main' : certStatus.status === 'EXPIRING_SOON' ? 'warning.main' : 'error.main' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">
                                <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Certificado Instalado
                            </Typography>
                            {getStatusChip(certStatus)}
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Titular</Typography>
                                <Typography variant="body2" noWrap>{certStatus.subject?.split(',')[0]?.replace('CN=', '') || '-'}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Emisor</Typography>
                                <Typography variant="body2" noWrap>{certStatus.issuer?.split(',')[0]?.replace('CN=', '') || '-'}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Válido desde</Typography>
                                <Typography variant="body2">{certStatus.validFrom ? new Date(certStatus.validFrom).toLocaleDateString() : '-'}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Válido hasta</Typography>
                                <Typography variant="body2" color={certStatus.status === 'EXPIRED' ? 'error.main' : 'inherit'}>
                                    {certStatus.validUntil ? new Date(certStatus.validUntil).toLocaleDateString() : '-'}
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            ) : (
                <Alert severity="info" sx={{ mb: 3 }}>
                    No hay certificado configurado. Sube uno para poder firmar facturas VeriFactu.
                </Alert>
            )}

            {/* Info Card */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 3,
                    bgcolor: 'info.main',
                    color: 'info.contrastText',
                    borderRadius: 2
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Info sx={{ mt: 0.5 }} />
                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                            Requisitos del certificado
                        </Typography>
                        <List dense disablePadding>
                            <ListItem disableGutters>
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                    <Security fontSize="small" sx={{ color: 'inherit' }} />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Certificado de representante de persona jurídica (empresa)"
                                    primaryTypographyProps={{ variant: 'body2' }}
                                />
                            </ListItem>
                            <ListItem disableGutters>
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                    <CheckCircle fontSize="small" sx={{ color: 'inherit' }} />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Emitido por CA reconocida (FNMT, Camerfirma, etc.)"
                                    primaryTypographyProps={{ variant: 'body2' }}
                                />
                            </ListItem>
                            <ListItem disableGutters>
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                    <CheckCircle fontSize="small" sx={{ color: 'inherit' }} />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Formato P12 o PFX"
                                    primaryTypographyProps={{ variant: 'body2' }}
                                />
                            </ListItem>
                        </List>
                    </Box>
                </Box>
            </Paper>

            {/* Upload Form */}
            <Card elevation={2}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        {certStatus?.configured ? 'Actualizar Certificado' : 'Subir Certificado'}
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                            <Alert severity="info" icon={<Security />}>
                                Empresa: <strong>{currentCompany?.businessName || `ID ${companyId}`}</strong>
                            </Alert>

                            {/* File Upload */}
                            <Box>
                                <Typography variant="subtitle2" gutterBottom>
                                    Archivo de certificado (.p12 / .pfx)
                                </Typography>
                                <Button
                                    component="label"
                                    variant="outlined"
                                    startIcon={<CloudUpload />}
                                    fullWidth
                                    sx={{
                                        py: 2,
                                        borderStyle: 'dashed',
                                        borderWidth: 2,
                                        '&:hover': { borderWidth: 2 }
                                    }}
                                >
                                    {file ? file.name : 'Seleccionar certificado...'}
                                    <input
                                        type="file"
                                        hidden
                                        accept=".p12,.pfx"
                                        onChange={handleFileChange}
                                    />
                                </Button>
                            </Box>

                            {/* Password */}
                            <TextField
                                label="Contraseña del certificado"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                fullWidth
                                required
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                helperText="La contraseña con la que protegiste el certificado"
                            />

                            {/* Messages */}
                            {error && (
                                <Alert severity="error" icon={<Warning />}>
                                    {error}
                                </Alert>
                            )}

                            {success && (
                                <Alert severity="success" icon={<CheckCircle />}>
                                    Certificado subido y validado correctamente. Ya puedes firmar facturas con VeriFactu.
                                </Alert>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={isUploading || !file || !password}
                                startIcon={isUploading ? <CircularProgress size={20} /> : <Security />}
                            >
                                {isUploading ? 'Subiendo...' : certStatus?.configured ? 'Actualizar certificado' : 'Subir certificado'}
                            </Button>
                        </Box>
                    </form>
                </CardContent>
            </Card>

            {/* Help Link */}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                ¿No tienes certificado? Puedes obtenerlo en{' '}
                <a
                    href="https://www.sede.fnmt.gob.es/certificados/certificado-de-representante"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'inherit' }}
                >
                    sede.fnmt.gob.es
                </a>
            </Typography>
        </Box>
    );
};

export default CertificateSettingsPage;
