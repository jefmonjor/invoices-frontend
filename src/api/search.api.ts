import { apiClient } from './client';
import type { Invoice } from '@/types/invoice.types';
import type { Client } from '@/types/client.types';
import type { Company } from '@/types/company.types';

/**
 * Response de búsqueda global según contrato del backend
 * GET /api/search?q=ABC&type=all
 */
export interface SearchResponse {
  invoices: Invoice[];
  clients: Client[];
  companies: Company[];
  totalResults: number;
}

/**
 * Parámetros de búsqueda
 */
export interface SearchParams {
  q: string; // Query de búsqueda (según contrato)
  type?: 'all' | 'invoices' | 'clients' | 'companies';
}

export const searchApi = {
  /**
   * Búsqueda global en todos los tipos
   * GET /api/search?q=ABC&type=all
   */
  global: async (params: SearchParams): Promise<SearchResponse> => {
    const { data } = await apiClient.get<SearchResponse>('/api/search', {
      params: {
        q: params.q,
        type: params.type || 'all',
      },
    });
    return data;
  },

  /**
   * Búsqueda específica en facturas
   * GET /api/search?q=ABC&type=invoices
   */
  searchInvoices: async (q: string): Promise<SearchResponse> => {
    const { data } = await apiClient.get<SearchResponse>('/api/search', {
      params: { q, type: 'invoices' },
    });
    return data;
  },

  /**
   * Búsqueda específica en clientes
   * GET /api/search?q=ABC&type=clients
   */
  searchClients: async (q: string): Promise<SearchResponse> => {
    const { data } = await apiClient.get<SearchResponse>('/api/search', {
      params: { q, type: 'clients' },
    });
    return data;
  },

  /**
   * Búsqueda específica en empresas
   * GET /api/search?q=ABC&type=companies
   */
  searchCompanies: async (q: string): Promise<SearchResponse> => {
    const { data } = await apiClient.get<SearchResponse>('/api/search', {
      params: { q, type: 'companies' },
    });
    return data;
  },
};
