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
import { Search, Description, Business, People, Person } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { debounce } from '@/utils/validators';

interface SearchResult {
  type: 'invoice' | 'company' | 'client' | 'user';
  id: number;
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
    case 'invoice':
      return <Description />;
    case 'company':
      return <Business />;
    case 'client':
      return <People />;
    case 'user':
      return <Person />;
  }
};

const getTypeLabel = (type: SearchResult['type']) => {
  switch (type) {
    case 'invoice':
      return 'Factura';
    case 'company':
      return 'Empresa';
    case 'client':
      return 'Cliente';
    case 'user':
      return 'Usuario';
  }
};

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
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

  // Search functionality - disabled until API is implemented
  const { data: results, isLoading } = useQuery<SearchResult[]>({
    queryKey: ['global-search', debouncedSearch],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!debouncedSearch || debouncedSearch.length < 2) {
        return [];
      }

      // Search API not implemented yet - return empty results
      // TODO: Connect to /api/search when backend endpoint is ready
      return [];
    },
    enabled: debouncedSearch.length >= 2,
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
          placeholder="Buscar facturas, empresas, clientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
          }}
          sx={{ mb: 2 }}
        />

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

        {!isLoading && debouncedSearch.length >= 2 && results?.length === 0 && (
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
