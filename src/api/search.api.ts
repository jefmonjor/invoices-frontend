import { apiClient } from './client';

/**
 * Search Result from backend
 * Matches SearchResult.java record
 */
export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'INVOICE' | 'CLIENT' | 'COMPANY';
  url: string;
}

/**
 * Search API - matches backend SearchController.java
 */
export const searchApi = {
  /**
   * Global search across invoices, clients
   * GET /api/search?query=ABC&companyId=X
   */
  searchGlobal: async (query: string, companyId: number): Promise<SearchResult[]> => {
    const { data } = await apiClient.get<SearchResult[]>('/api/search', {
      params: { query, companyId },
    });
    return data;
  },

  /**
   * Search invoices only
   * GET /api/search/invoices?query=ABC&companyId=X
   */
  searchInvoices: async (query: string, companyId: number): Promise<SearchResult[]> => {
    const { data } = await apiClient.get<SearchResult[]>('/api/search/invoices', {
      params: { query, companyId },
    });
    return data;
  },

  /**
   * Search clients only
   * GET /api/search/clients?query=ABC&companyId=X
   */
  searchClients: async (query: string, companyId: number): Promise<SearchResult[]> => {
    const { data } = await apiClient.get<SearchResult[]>('/api/search/clients', {
      params: { query, companyId },
    });
    return data;
  },

  /**
   * Get search suggestions
   * GET /api/search/suggestions?query=ABC&companyId=X
   */
  getSuggestions: async (query: string, companyId: number): Promise<string[]> => {
    const { data } = await apiClient.get<string[]>('/api/search/suggestions', {
      params: { query, companyId },
    });
    return data;
  },
};
