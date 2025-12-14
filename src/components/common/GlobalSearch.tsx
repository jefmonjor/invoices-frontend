import { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  TextField,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Search, Description, Business, People } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { debounce } from '@/utils/validators';
import { searchApi, type SearchResult as ApiSearchResult } from '@/api/search.api';
import { useCompanyContext } from '@/contexts/useCompanyContext';

interface SearchResult {
  type: 'INVOICE' | 'CLIENT' | 'COMPANY';
  id: string;
  title: string;
  subtitle: string;
  url: string;
}

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

const getIcon = (type: SearchResult['type']) => {
  switch (type) {
    case 'INVOICE':
      return <Description />;
    case 'COMPANY':
      return <Business />;
    case 'CLIENT':
      return <People />;
  }
};

const getTypeLabel = (type: SearchResult['type']) => {
  switch (type) {
    case 'INVOICE':
      return 'Factura';
    case 'COMPANY':
      return 'Empresa';
    case 'CLIENT':
      return 'Cliente';
  }
};

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { currentCompany } = useCompanyContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  const debouncedSetSearch = useMemo(
    () => debounce((value: string) => setDebouncedSearch(value), 300),
    []
  );

  useEffect(() => {
    debouncedSetSearch(searchTerm);
  }, [searchTerm, debouncedSetSearch]);

  // Search using real API
  const { data: results, isLoading } = useQuery<SearchResult[]>({
    queryKey: ['global-search', debouncedSearch, currentCompany?.id],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!debouncedSearch || debouncedSearch.length < 2 || !currentCompany?.id) {
        return [];
      }

      const apiResults = await searchApi.searchGlobal(debouncedSearch, currentCompany.id);

      // Map API results to component's expected format
      return apiResults.map((r: ApiSearchResult) => ({
        id: r.id,
        title: r.title,
        subtitle: r.subtitle,
        type: r.type,
        url: r.url,
      }));
    },
    enabled: debouncedSearch.length >= 2 && !!currentCompany?.id,
  });

  const handleResultClick = (url: string) => {
    navigate(url);
    onClose();
    setSearchTerm('');
  };

  const handleClose = () => {
    onClose();
    setSearchTerm('');
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          placeholder="Buscar facturas, clientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
          }}
          sx={{ mb: 2 }}
        />

        {!currentCompany && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              Selecciona una empresa para buscar
            </Typography>
          </Box>
        )}

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!isLoading && results && results.length > 0 && (
          <List>
            {results.map((result) => (
              <ListItemButton
                key={`${result.type}-${result.id}`}
                onClick={() => handleResultClick(result.url)}
                sx={{
                  borderRadius: 1,
                  mb: 1,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon>{getIcon(result.type)}</ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1">{result.title}</Typography>
                      <Chip label={getTypeLabel(result.type)} size="small" />
                    </Box>
                  }
                  secondary={result.subtitle}
                />
              </ListItemButton>
            ))}
          </List>
        )}

        {!isLoading && debouncedSearch.length >= 2 && results?.length === 0 && currentCompany && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              No se encontraron resultados para "{debouncedSearch}"
            </Typography>
          </Box>
        )}

        {debouncedSearch.length < 2 && searchTerm.length > 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              Escribe al menos 2 caracteres para buscar
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
