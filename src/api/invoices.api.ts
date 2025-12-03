import { apiClient } from './client';
import type {
  Invoice,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  InvoiceListParams,
} from '@/types/invoice.types';

export interface PaginatedInvoiceResponse {
  data: Invoice[];
  totalCount: number;
}

export const invoicesApi = {
  // Listar facturas (paginado con X-Total-Count header según backend contract)
  list: async (params?: InvoiceListParams): Promise<PaginatedInvoiceResponse> => {
    const response = await apiClient.get<Invoice[]>('/api/invoices', {
      params,
    });

    // Extraer X-Total-Count del header según contrato backend
    const totalCount = parseInt(response.headers['x-total-count'] || '0', 10);

    return {
      data: response.data,
      totalCount,
    };
  },

  // Obtener factura por ID
  getById: async (id: number): Promise<Invoice> => {
    const response = await apiClient.get<Invoice>(`/api/invoices/${id}`);
    return response.data;
  },

  // Crear factura
  create: async (data: CreateInvoiceRequest): Promise<Invoice> => {
    const response = await apiClient.post<Invoice>('/api/invoices', data);
    return response.data;
  },

  // Actualizar factura
  update: async (id: number, data: UpdateInvoiceRequest): Promise<Invoice> => {
    const response = await apiClient.put<Invoice>(`/api/invoices/${id}`, data);
    return response.data;
  },

  // Eliminar factura
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/invoices/${id}`);
  },

  // Generar/Descargar PDF
  // Según contrato del backend: GET /api/invoices/{id}/pdf
  // Generar/Descargar PDF
  // Según contrato del backend: GET /api/invoices/{id}/pdf?version=draft|final
  generatePDF: async (id: number, version: 'draft' | 'final' = 'draft'): Promise<Blob> => {
    const response = await apiClient.get(`/api/invoices/${id}/pdf`, {
      params: { version },
      responseType: 'blob',
    });
    return response.data;
  },

  // Descargar PDF
  downloadPDF: async (id: number, invoiceNumber: string, version: 'draft' | 'final' = 'draft'): Promise<void> => {
    const blob = await invoicesApi.generatePDF(id, version);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoice-${invoiceNumber.replace(/\//g, '_')}-${version}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
