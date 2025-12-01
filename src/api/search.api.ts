import { api } from './axios';

export interface SearchResult {
    id: string;
    title: string;
    subtitle: string;
    type: 'INVOICE' | 'CLIENT' | 'COMPANY';
    url: string;
}

export const searchApi = {
    global: async (query: string, companyId: number): Promise<SearchResult[]> => {
        const { data } = await api.get<SearchResult[]>('/search', {
            params: { query, companyId },
        });
        return data;
    },

    invoices: async (query: string, companyId: number): Promise<SearchResult[]> => {
        const { data } = await api.get<SearchResult[]>('/search/invoices', {
            params: { query, companyId },
        });
        return data;
    },

    clients: async (query: string, companyId: number): Promise<SearchResult[]> => {
        const { data } = await api.get<SearchResult[]>('/search/clients', {
            params: { query, companyId },
        });
        return data;
    },

    suggestions: async (query: string, companyId: number): Promise<string[]> => {
        const { data } = await api.get<string[]>('/search/suggestions', {
            params: { query, companyId },
        });
        return data;
    },
};
