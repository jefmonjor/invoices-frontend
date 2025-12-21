import React from 'react';
import {
    Paper,
    Typography,
    Button,
    ButtonGroup,
    Chip,
    Stack,
    CircularProgress,
    Tooltip,
    IconButton,
    Skeleton,
    Box,
    Divider,
} from '@mui/material';
import {
    Download as DownloadIcon,
    FileDownload as ZipIcon,
    GridOn as ExcelIcon,
    NavigateBefore as PrevIcon,
    NavigateNext as NextIcon,
    CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { invoicesApi } from '@/api/invoices.api';
import type { QuarterSummaryResponse } from '@/api/invoices.api';

interface QuarterSelectorProps {
    selectedYear: number;
    selectedQuarter: number;
    onYearChange: (year: number) => void;
    onQuarterChange: (quarter: number) => void;
    onDownloadQuarter: (year: number, quarter: number) => void;
    onDownloadAll: (year: number) => void;
    onExportExcel: (year: number, quarter?: number) => void;
    isDownloading?: boolean;
}

export const QuarterSelector: React.FC<QuarterSelectorProps> = ({
    selectedYear,
    selectedQuarter,
    onYearChange,
    onQuarterChange,
    onDownloadQuarter,
    onDownloadAll,
    onExportExcel,
    isDownloading = false,
}) => {

    // Fetch quarter summary data
    const { data: quarterSummary, isLoading, isError } = useQuery<QuarterSummaryResponse>({
        queryKey: ['quarterSummary', selectedYear],
        queryFn: () => invoicesApi.getQuarterSummary(selectedYear),
        staleTime: 30000, // 30 seconds
    });

    const quarters = [
        { id: 1, label: 'T1', fullLabel: 'Ene - Mar', months: '(Ene-Mar)' },
        { id: 2, label: 'T2', fullLabel: 'Abr - Jun', months: '(Abr-Jun)' },
        { id: 3, label: 'T3', fullLabel: 'Jul - Sep', months: '(Jul-Sep)' },
        { id: 4, label: 'T4', fullLabel: 'Oct - Dic', months: '(Oct-Dic)' },
    ];

    const getQuarterCount = (quarter: number): number => {
        if (!quarterSummary?.quarters) return 0;
        const key = `Q${quarter}` as keyof typeof quarterSummary.quarters;
        return quarterSummary.quarters[key] || 0;
    };

    const currentQuarter = quarterSummary?.currentQuarter || Math.ceil((new Date().getMonth() + 1) / 3);
    const currentYear = new Date().getFullYear();
    const selectedQuarterCount = getQuarterCount(selectedQuarter);

    // Show skeleton during loading
    if (isLoading) {
        return (
            <Paper sx={{ p: 2, mb: 3 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
                    <Skeleton variant="rectangular" width={140} height={40} />
                    <Skeleton variant="rectangular" width={320} height={48} />
                    <Skeleton variant="rectangular" width={280} height={40} />
                </Stack>
            </Paper>
        );
    }

    // Show error state
    if (isError) {
        return (
            <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
                <Typography>Error al cargar los datos de trimestres</Typography>
            </Paper>
        );
    }

    return (
        <Paper
            sx={{
                p: 2,
                mb: 3,
                background: (theme) => theme.palette.mode === 'dark'
                    ? 'linear-gradient(145deg, rgba(30,30,40,0.9), rgba(20,20,30,0.95))'
                    : 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(248,250,252,1))',
                border: '1px solid',
                borderColor: 'divider',
            }}
        >
            <Stack spacing={2}>
                {/* Header with Year Navigation */}
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ pb: 1 }}
                >
                    <CalendarIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                        Vista Trimestral
                    </Typography>
                </Stack>

                {/* Main content row */}
                <Stack
                    direction={{ xs: 'column', lg: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'stretch', lg: 'center' }}
                    spacing={2}
                >
                    {/* Year Navigation */}
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={0.5}
                        sx={{
                            bgcolor: 'action.hover',
                            borderRadius: 2,
                            px: 1,
                            py: 0.5,
                        }}
                    >
                        <IconButton
                            size="small"
                            onClick={() => onYearChange(selectedYear - 1)}
                            disabled={selectedYear <= 2020}
                            aria-label="Año anterior"
                        >
                            <PrevIcon />
                        </IconButton>
                        <Typography
                            variant="h6"
                            sx={{
                                minWidth: 60,
                                textAlign: 'center',
                                fontWeight: 700,
                            }}
                        >
                            {selectedYear}
                        </Typography>
                        <IconButton
                            size="small"
                            onClick={() => onYearChange(selectedYear + 1)}
                            disabled={selectedYear >= currentYear}
                            aria-label="Año siguiente"
                        >
                            <NextIcon />
                        </IconButton>
                    </Stack>

                    {/* Quarter Buttons */}
                    <ButtonGroup
                        variant="outlined"
                        size="medium"
                        sx={{
                            '& .MuiButton-root': {
                                minWidth: { xs: 70, sm: 85 },
                                py: 1,
                            }
                        }}
                    >
                        {quarters.map((quarter) => {
                            const count = getQuarterCount(quarter.id);
                            const isSelected = selectedQuarter === quarter.id;
                            const isCurrent = selectedYear === currentYear && quarter.id === currentQuarter;

                            return (
                                <Tooltip
                                    key={quarter.id}
                                    title={`${quarter.fullLabel} - ${count} facturas`}
                                    arrow
                                >
                                    <Button
                                        variant={isSelected ? 'contained' : 'outlined'}
                                        onClick={() => onQuarterChange(quarter.id)}
                                        sx={{
                                            position: 'relative',
                                            borderColor: isCurrent && !isSelected ? 'primary.main' : undefined,
                                            borderWidth: isCurrent && !isSelected ? 2 : 1,
                                            flexDirection: 'column',
                                            gap: 0.25,
                                        }}
                                        aria-label={`${quarter.fullLabel} - ${count} facturas`}
                                    >
                                        <Typography
                                            variant="button"
                                            sx={{ fontWeight: isSelected ? 700 : 500 }}
                                        >
                                            {quarter.label}
                                        </Typography>
                                        <Chip
                                            label={count}
                                            size="small"
                                            color={isSelected ? 'default' : count > 0 ? 'primary' : 'default'}
                                            sx={{
                                                height: 18,
                                                fontSize: '0.7rem',
                                                fontWeight: 600,
                                                bgcolor: isSelected ? 'rgba(255,255,255,0.25)' : undefined,
                                                minWidth: 28,
                                            }}
                                        />
                                    </Button>
                                </Tooltip>
                            );
                        })}
                    </ButtonGroup>

                    {/* Action Buttons */}
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{ flexWrap: 'wrap', gap: 1 }}
                    >
                        {/* Download Quarter Button (Primary) */}
                        <Tooltip title={selectedQuarterCount === 0 ? 'No hay facturas en este trimestre' : ''}>
                            <span>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={isDownloading ? <CircularProgress size={16} color="inherit" /> : <ZipIcon />}
                                    onClick={() => onDownloadQuarter(selectedYear, selectedQuarter)}
                                    disabled={isDownloading || selectedQuarterCount === 0}
                                    sx={{
                                        minWidth: 130,
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {isDownloading ? 'Descargando...' : `ZIP T${selectedQuarter}`}
                                </Button>
                            </span>
                        </Tooltip>

                        {/* Download All Button (Secondary) */}
                        <Button
                            variant="outlined"
                            color="inherit"
                            startIcon={<DownloadIcon />}
                            onClick={() => onDownloadAll(selectedYear)}
                            disabled={isDownloading || (quarterSummary?.totalCount || 0) === 0}
                            size="small"
                            sx={{ whiteSpace: 'nowrap' }}
                        >
                            Todo {selectedYear}
                        </Button>

                        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />

                        {/* Export Excel Button */}
                        <Tooltip title={`Exportar T${selectedQuarter} a Excel`}>
                            <span>
                                <Button
                                    variant="outlined"
                                    color="success"
                                    startIcon={<ExcelIcon />}
                                    onClick={() => onExportExcel(selectedYear, selectedQuarter)}
                                    disabled={isDownloading || selectedQuarterCount === 0}
                                    size="small"
                                    sx={{ minWidth: 90 }}
                                >
                                    Excel
                                </Button>
                            </span>
                        </Tooltip>
                    </Stack>
                </Stack>

                {/* Summary Footer */}
                <Box
                    sx={{
                        display: 'flex',
                        gap: 3,
                        pt: 1,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        flexWrap: 'wrap',
                    }}
                >
                    <Typography variant="body2" color="text.secondary">
                        <strong>{quarterSummary?.totalCount || 0}</strong> facturas en {selectedYear}
                    </Typography>
                    <Typography variant="body2" color="primary">
                        <strong>{selectedQuarterCount}</strong> en T{selectedQuarter} {quarters[selectedQuarter - 1]?.months}
                    </Typography>
                </Box>
            </Stack>
        </Paper>
    );
};

export default QuarterSelector;

