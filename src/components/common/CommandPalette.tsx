import React, { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    TextField,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    InputAdornment,
    Typography,
    Box,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    Search as SearchIcon,
    Description as InvoiceIcon,
    Business as CompanyIcon,
    Person as ClientIcon,
    ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';
import { searchApi, SearchResult } from '@/api/search.api';
import { useAuthStore } from '@/stores/auth.store';

export const CommandPalette: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 300);
    const navigate = useNavigate();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const { user } = useAuthStore();
    const companyId = user?.companyId;

    // Toggle open/close with Cmd+K or Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Search Query
    const { data: results = [], isLoading } = useQuery({
        queryKey: ['search', debouncedQuery, companyId],
        queryFn: () => {
            if (!debouncedQuery || !companyId) return [];
            return searchApi.global(debouncedQuery, companyId);
        },
        enabled: open && debouncedQuery.length > 1 && !!companyId,
        staleTime: 1000 * 60, // 1 minute
    });

    const handleClose = () => {
        setOpen(false);
        setQuery('');
    };

    const handleSelect = (result: SearchResult) => {
        navigate(result.url);
        handleClose();
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'INVOICE':
                return <InvoiceIcon />;
            case 'CLIENT':
                return <ClientIcon />;
            case 'COMPANY':
                return <CompanyIcon />;
            default:
                return <SearchIcon />;
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
            fullScreen={fullScreen}
            PaperProps={{
                sx: {
                    position: 'fixed',
                    top: fullScreen ? 0 : '20%',
                    m: fullScreen ? 0 : 2,
                    maxHeight: '60vh',
                    borderRadius: 2,
                },
            }}
        >
            <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <TextField
                        autoFocus
                        fullWidth
                        placeholder="Buscar facturas, clientes... (Cmd+K)"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                            disableUnderline: true,
                        }}
                        variant="standard"
                    />
                </Box>

                {isLoading && (
                    <Box sx={{ p: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            Buscando...
                        </Typography>
                    </Box>
                )}

                {!isLoading && results.length === 0 && query.length > 1 && (
                    <Box sx={{ p: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            No se encontraron resultados.
                        </Typography>
                    </Box>
                )}

                <List sx={{ overflow: 'auto', flex: 1, py: 0 }}>
                    {results.map((result) => (
                        <ListItemButton
                            key={`${result.type}-${result.id}`}
                            onClick={() => handleSelect(result)}
                            divider
                        >
                            <ListItemIcon>{getIcon(result.type)}</ListItemIcon>
                            <ListItemText
                                primary={result.title}
                                secondary={result.subtitle}
                                primaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                            />
                            <ArrowIcon fontSize="small" color="action" />
                        </ListItemButton>
                    ))}
                </List>

                {!fullScreen && (
                    <Box sx={{ p: 1, bgcolor: 'action.hover', borderTop: 1, borderColor: 'divider' }}>
                        <Typography variant="caption" color="text.secondary" align="center" display="block">
                            Usa las flechas para navegar, Enter para seleccionar, Esc para cerrar
                        </Typography>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
};
