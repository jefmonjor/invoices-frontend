import { apiClient } from './client';
import type {
  Invoice,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  InvoiceListParams,
} from '@/types/invoice.types';

export interface InvoiceListResponse {
  invoices: Invoice[];
  totalCount: number;
}

export interface CanonicalJsonResponse {
  canonicalJson: string;
  documentHash: string;
}

export interface VerificationStatusResponse {
  invoiceId: number;
  verifactuStatus: string;
  verifactuTxId: string | null;
  qrPayload: string | null;
  documentHash: string | null;
  lastVerificationAttempt: string | null;
  error: string | null;
}

export const invoicesApi = {
  // Listar facturas (paginado según contrato del backend)
  // Backend devuelve array en body + X-Total-Count en headers
  list: async (params?: InvoiceListParams): Promise<InvoiceListResponse> => {
    const response = await apiClient.get<Invoice[]>('/api/invoices', {
      params,
    });

    // Extraer total count del header X-Total-Count
    const totalCount = parseInt(response.headers['x-total-count'] || '0', 10);

    return {
      invoices: response.data,
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

  // Obtener JSON canónico de la factura
  // GET /api/invoices/{id}/canonical
  getCanonical: async (id: number): Promise<CanonicalJsonResponse> => {
    const response = await apiClient.get<CanonicalJsonResponse>(`/api/invoices/${id}/canonical`);
    return response.data;
  },

  // Obtener estado de verificación de Verifactu
  // GET /api/invoices/{id}/verification-status
  getVerificationStatus: async (id: number): Promise<VerificationStatusResponse> => {
    const response = await apiClient.get<VerificationStatusResponse>(`/api/invoices/${id}/verification-status`);
    return response.data;
  },

  // Reintentar verificación VeriFactu manualmente
  // POST /api/invoices/{id}/retry-verifactu
  retryVerifactu: async (id: number): Promise<{ message: string; invoiceId: number; verifactuStatus: string }> => {
    const response = await apiClient.post<{ message: string; invoiceId: number; verifactuStatus: string }>(
      `/api/invoices/${id}/retry-verifactu`
    );
    return response.data;
  },
};
