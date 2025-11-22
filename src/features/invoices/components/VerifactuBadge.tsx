import React from 'react';
import { Chip, Tooltip, CircularProgress, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CancelIcon from '@mui/icons-material/Cancel';

export type VerifactuStatus = 'NOT_SENT' | 'PENDING' | 'PROCESSING' | 'ACCEPTED' | 'REJECTED' | 'FAILED';

interface VerifactuBadgeProps {
    status?: VerifactuStatus | string;
    txId?: string | null;
    errorMessage?: string | null;
}

/**
 * Badge component to display VeriFactu verification status with visual indicators
 * 
 * States:
 * - NOT_SENT: Gray "Sin verificar"
 * - PENDING/PROCESSING: Yellow "Verificando..." with spinner
 * - ACCEPTED: Green "✅ Verificado VeriFactu"
 * - REJECTED/FAILED: Red "❌ Rechazado" with error tooltip
 */
const VerifactuBadge: React.FC<VerifactuBadgeProps> = ({ status = 'NOT_SENT', txId, errorMessage }) => {
    const normalizedStatus = (status?.toUpperCase() || 'NOT_SENT') as VerifactuStatus;

    const configs = {
        'NOT_SENT': {
            icon: <HelpOutlineIcon fontSize="small" />,
            text: '🔴 Sin verificar',
            color: 'default' as const,
            tooltip: 'La factura aún no ha sido enviada a VeriFactu/AEAT'
        },
        'PENDING': {
            icon: <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}><CircularProgress size={14} /></Box>,
            text: '🟡 Verificando...',
            color: 'warning' as const,
            tooltip: 'Verificación en curso...'
        },
        'PROCESSING': {
            icon: <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}><CircularProgress size={14} /></Box>,
            text: '🟡 Procesando...',
            color: 'warning' as const,
            tooltip: 'Procesando verificación con VeriFactu/AEAT'
        },
        'ACCEPTED': {
            icon: <CheckCircleIcon fontSize="small" />,
            text: '✅ Verificado VeriFactu',
            color: 'success' as const,
            tooltip: txId ? `Verificado correctamente. TxID: ${txId}` : 'Verificado correctamente con VeriFactu/AEAT'
        },
        'REJECTED': {
            icon: <ErrorIcon fontSize="small" />,
            text: '❌ Rechazado',
            color: 'error' as const,
            tooltip: errorMessage || 'Verificación rechazada por VeriFactu/AEAT - Ver detalles'
        },
        'FAILED': {
            icon: <CancelIcon fontSize="small" />,
            text: '❌ Error',
            color: 'error' as const,
            tooltip: errorMessage || 'Error en el proceso de verificación'
        }
    };

    // Safe cast to ensure we handle unknown strings gracefully
    const safeStatus = (normalizedStatus in configs ? normalizedStatus : 'NOT_SENT') as VerifactuStatus;
    const config = configs[safeStatus];

    return (
        <Tooltip title={config.tooltip} arrow placement="top">
            <Chip
                icon={config.icon}
                label={config.text}
                color={config.color}
                size="medium"
                variant="filled"
                sx={{
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                    cursor: 'help',
                    boxShadow: 1
                }}
            />
        </Tooltip>
    );
};

export default VerifactuBadge;
