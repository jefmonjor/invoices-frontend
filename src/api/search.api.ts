import { apiClient } from './client';

export interface SearchResult {
    id: string;
    title: string;
    subtitle: string;
    type: 'INVOICE' | 'CLIENT' | 'COMPANY';
    url: string;
}

export const searchApi = {
    global: async (query: string, companyId: number): Promise<SearchResult[]> => {
        const { data } = await apiClient.get<SearchResult[]>('/api/search', {
            params: { query, companyId },
        });
        return data;
    },

    invoices: async (query: string, companyId: number): Promise<SearchResult[]> => {
        const { data } = await apiClient.get<SearchResult[]>('/api/search/invoices', {
            params: { query, companyId },
        });
        return data;
    },

    clients: async (query: string, companyId: number): Promise<SearchResult[]> => {
        const { data } = await apiClient.get<SearchResult[]>('/api/search/clients', {
            params: { query, companyId },
        });
        return data;
    },

    suggestions: async (query: string, companyId: number): Promise<string[]> => {
        const { data } = await apiClient.get<string[]>('/api/search/suggestions', {
            params: { query, companyId },
        });
        return data;
    },
};
