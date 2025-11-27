import React from 'react';
import { Chip, Tooltip, CircularProgress, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation(['invoices']);
    const normalizedStatus = (status?.toUpperCase() || 'NOT_SENT') as VerifactuStatus;

    const configs = {
        'NOT_SENT': {
            icon: <HelpOutlineIcon fontSize="small" />,
            text: t('invoices:verifactu.status.notSent'),
            color: 'default' as const,
            tooltip: t('invoices:verifactu.tooltip.notSent')
        },
        'PENDING': {
            icon: <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}><CircularProgress size={14} /></Box>,
            text: t('invoices:verifactu.status.pending'),
            color: 'warning' as const,
            tooltip: t('invoices:verifactu.tooltip.pending')
        },
        'PROCESSING': {
            icon: <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}><CircularProgress size={14} /></Box>,
            text: t('invoices:verifactu.status.processing'),
            color: 'warning' as const,
            tooltip: t('invoices:verifactu.tooltip.processing')
        },
        'ACCEPTED': {
            icon: <CheckCircleIcon fontSize="small" />,
            text: t('invoices:verifactu.status.accepted'),
            color: 'success' as const,
            tooltip: txId ? t('invoices:verifactu.tooltip.acceptedWithTxId', { txId }) : t('invoices:verifactu.tooltip.accepted')
        },
        'REJECTED': {
            icon: <ErrorIcon fontSize="small" />,
            text: t('invoices:verifactu.status.rejected'),
            color: 'error' as const,
            tooltip: errorMessage || t('invoices:verifactu.tooltip.rejected')
        },
        'FAILED': {
            icon: <CancelIcon fontSize="small" />,
            text: t('invoices:verifactu.status.failed'),
            color: 'error' as const,
            tooltip: errorMessage || t('invoices:verifactu.tooltip.failed')
        }
    };

    // Safe cast to ensure we handle unknown strings gracefully
    const safeStatus = (normalizedStatus in configs ? normalizedStatus : 'NOT_SENT') as VerifactuStatus;
    const config = configs[safeStatus];

    const isPending = safeStatus === 'PENDING' || safeStatus === 'PROCESSING';

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
                    boxShadow: 1,
                    ...(isPending && {
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': {
                            '0%': {
                                boxShadow: '0 0 0 0 rgba(237, 108, 2, 0.4)',
                            },
                            '70%': {
                                boxShadow: '0 0 0 10px rgba(237, 108, 2, 0)',
                            },
                            '100%': {
                                boxShadow: '0 0 0 0 rgba(237, 108, 2, 0)',
                            },
                        },
                    }),
                }}
            />
        </Tooltip>
    );
};

export default VerifactuBadge;
