import React, { useState, useEffect, useMemo } from 'react';
import {
    Dialog,
    DialogContent,
    TextField,
    List,
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
import { useDebounce } from '../../hooks/useDebounce';
import { searchApi, type SearchResponse } from '../../api/search.api';
import type { Invoice } from '@/types/invoice.types';
import type { Client } from '@/types/client.types';
import type { Company } from '@/types/company.types';

interface SearchResultItem {
    id: string;
    title: string;
    subtitle: string;
    type: 'INVOICE' | 'CLIENT' | 'COMPANY';
    url: string;
}

/**
 * Adapter function to convert new SearchResponse to old SearchResult[] format
 */
function adaptSearchResponse(data: SearchResponse): SearchResultItem[] {
    const results: SearchResultItem[] = [];

    // Convert invoices
    data.invoices.forEach((invoice: Invoice) => {
        results.push({
            id: `invoice-${invoice.id}`,
            title: `Factura ${invoice.invoiceNumber}`,
            subtitle: invoice.client?.businessName || 'Sin cliente',
            type: 'INVOICE',
            url: `/invoices/${invoice.id}`,
        });
    });

    // Convert clients
    data.clients.forEach((client: Client) => {
        results.push({
            id: `client-${client.id}`,
            title: client.businessName,
            subtitle: client.taxId || '',
            type: 'CLIENT',
            url: `/clients/${client.id}`,
        });
    });

    // Convert companies
    data.companies.forEach((company: Company) => {
        results.push({
            id: `company-${company.id}`,
            title: company.businessName,
            subtitle: company.taxId || '',
            type: 'COMPANY',
            url: `/companies/${company.id}`,
        });
    });

    return results;
}

export const CommandPalette: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 300);
    const navigate = useNavigate();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

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

    // Search Query - using new API with 'q' parameter
    const { data: searchData, isLoading } = useQuery({
        queryKey: ['search', debouncedQuery],
        queryFn: () => {
            if (!debouncedQuery) {
                return { invoices: [], clients: [], companies: [], totalResults: 0 };
            }
            return searchApi.global({ q: debouncedQuery, type: 'all' });
        },
        enabled: open && debouncedQuery.length > 1,
        staleTime: 1000 * 60, // 1 minute
    });

    // Convert new API response to old format for backwards compatibility
    const results = useMemo(() => {
        if (!searchData) return [];
        return adaptSearchResponse(searchData);
    }, [searchData]);

    const handleClose = () => {
        setOpen(false);
        setQuery('');
    };

    const handleSelect = (result: SearchResultItem) => {
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
                            key={result.id}
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
