import { apiClient } from './client';
import type { Document, UploadDocumentResponse } from '@/types/document.types';

/**
 * API para gestión de documentos (PDFs adjuntos a facturas)
 * Backend: MinIO (dev) / Cloudflare R2 (prod)
 */
export const documentsApi = {
  /**
   * Subir un documento PDF
   * POST /api/documents
   */
  upload: async (file: File, invoiceId: number): Promise<UploadDocumentResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('invoiceId', invoiceId.toString());

    const response = await apiClient.post<UploadDocumentResponse>('/api/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Obtener metadata de un documento
   * GET /api/documents/{id}
   */
  getById: async (id: number): Promise<Document> => {
    const response = await apiClient.get<Document>(`/api/documents/${id}`);
    return response.data;
  },

  /**
   * Descargar un documento PDF
   * GET /api/documents/{id}/download
   * @returns Blob del archivo PDF
   */
  download: async (id: number): Promise<Blob> => {
    const response = await apiClient.get<Blob>(`/api/documents/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Listar documentos de una factura
   * GET /api/documents?invoiceId={invoiceId}
   */
  listByInvoice: async (invoiceId: number): Promise<Document[]> => {
    const response = await apiClient.get<Document[]>('/api/documents', {
      params: { invoiceId },
    });
    return response.data;
  },

  /**
   * Eliminar un documento
   * DELETE /api/documents/{id}
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/documents/${id}`);
  },
};
