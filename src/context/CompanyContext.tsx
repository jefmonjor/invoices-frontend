import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/api/client';

interface Company {
    id: number;
    businessName: string;
    taxId: string;
    // Add other fields as needed
}

interface CompanyContextType {
    currentCompany: Company | null;
    companies: Company[];
    setCurrentCompany: (company: Company) => void;
    refreshCompanies: () => Promise<void>;
    isLoading: boolean;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const refreshCompanies = async () => {
        try {
            setIsLoading(true);
            const response = await apiClient.get('/api/companies/my-companies');
            setCompanies(response.data);

            // If current company is not set, or not in the list, set to first one
            if (response.data.length > 0) {
                if (!currentCompany || !response.data.find((c: Company) => c.id === currentCompany.id)) {
                    setCurrentCompany(response.data[0]);
                }
            } else {
                setCurrentCompany(null);
            }
        } catch (error) {
            console.error('Failed to fetch companies', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Only fetch if authenticated (check token existence or similar)
        const token = localStorage.getItem('token');
        if (token) {
            refreshCompanies();
        } else {
            setIsLoading(false);
        }
    }, []);

    return (
        <CompanyContext.Provider value={{ currentCompany, companies, setCurrentCompany, refreshCompanies, isLoading }}>
            {children}
        </CompanyContext.Provider>
    );
};

export const useCompany = () => {
    const context = useContext(CompanyContext);
    if (context === undefined) {
        throw new Error('useCompany must be used within a CompanyProvider');
    }
    return context;
};
