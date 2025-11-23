import React from 'react';
import {
    Box,
    FormControl,
    Select,
    MenuItem,
    Typography,
    CircularProgress
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { Business as BusinessIcon } from '@mui/icons-material';
import { useCompany } from '@/context/CompanyContext';

export const CompanySelector: React.FC = () => {
    const { currentCompany, companies, setCurrentCompany, isLoading } = useCompany();

    const handleChange = (event: SelectChangeEvent<number>) => {
        const companyId = Number(event.target.value);
        const selectedCompany = companies.find(c => c.id === companyId);
        if (selectedCompany) {
            setCurrentCompany(selectedCompany);
            // Optionally trigger a backend switch or page reload if needed
            // For now, context update is enough for frontend state
        }
    };

    if (isLoading) {
        return <CircularProgress size={20} />;
    }

    if (companies.length === 0) {
        return null; // Or show "Create Company" button
    }

    return (
        <Box sx={{ minWidth: 200, mb: 2, px: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <BusinessIcon sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                    EMPRESA ACTUAL
                </Typography>
            </Box>
            <FormControl fullWidth size="small" variant="outlined">
                <Select
                    value={currentCompany?.id || ''}
                    onChange={handleChange}
                    displayEmpty
                    sx={{
                        bgcolor: 'background.paper',
                        '& .MuiSelect-select': {
                            py: 1,
                            display: 'flex',
                            alignItems: 'center',
                        }
                    }}
                >
                    {companies.map((company) => (
                        <MenuItem key={company.id} value={company.id}>
                            {company.businessName}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
};
