import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Box,
    Alert,
    CircularProgress,
    IconButton,
    InputAdornment,
} from '@mui/material';
import { ContentCopy as ContentCopyIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { companiesApi } from '@/api/companies.api';

interface InviteUserModalProps {
    open: boolean;
    onClose: () => void;
    companyId: number;
}

const InviteUserModal: React.FC<InviteUserModalProps> = ({ open, onClose, companyId }) => {
    const { t } = useTranslation('common');
    const [loading, setLoading] = useState(false);
    const [invitationCode, setInvitationCode] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [expiresIn, setExpiresIn] = useState(24); // Hours

    const handleGenerateCode = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await companiesApi.generateInvitation(companyId, expiresIn);
            setInvitationCode(response.code);
        } catch (err) {
            setError('Error generating invitation code');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyCode = () => {
        if (invitationCode) {
            navigator.clipboard.writeText(invitationCode);
            // Could add a toast here
        }
    };

    const handleClose = () => {
        setInvitationCode(null);
        setError(null);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>{t('company.invite.title', 'Invitar Usuario')}</DialogTitle>
            <DialogContent>
                <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Typography variant="body1">
                        {t('company.invite.description', 'Genera un código de invitación para que un nuevo usuario se una a esta empresa.')}
                    </Typography>

                    {error && <Alert severity="error">{error}</Alert>}

                    {!invitationCode ? (
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <TextField
                                label={t('company.invite.expiresIn', 'Expira en (horas)')}
                                type="number"
                                value={expiresIn}
                                onChange={(e) => setExpiresIn(Number(e.target.value))}
                                sx={{ width: 150 }}
                                InputProps={{ inputProps: { min: 1, max: 168 } }}
                            />
                            <Button
                                variant="contained"
                                onClick={handleGenerateCode}
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={20} /> : null}
                            >
                                {t('company.invite.generate', 'Generar Código')}
                            </Button>
                        </Box>
                    ) : (
                        <Box sx={{
                            p: 3,
                            bgcolor: 'action.hover',
                            borderRadius: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 2
                        }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                {t('company.invite.codeLabel', 'CÓDIGO DE INVITACIÓN')}
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                <TextField
                                    fullWidth
                                    value={invitationCode}
                                    InputProps={{
                                        readOnly: true,
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={handleCopyCode} edge="end">
                                                    <ContentCopyIcon />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                        sx: {
                                            fontSize: '1.5rem',
                                            textAlign: 'center',
                                            letterSpacing: 2,
                                            fontWeight: 'bold'
                                        }
                                    }}
                                />
                            </Box>

                            <Alert severity="warning" sx={{ width: '100%' }}>
                                {t('company.invite.warning', 'Este código expira en 24 horas. Compártelo solo con personas de confianza.')}
                            </Alert>
                        </Box>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>{t('common.close', 'Cerrar')}</Button>
            </DialogActions>
        </Dialog>
    );
};

export default InviteUserModal;
