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
   *
   * @param file - Archivo PDF a subir
   * @param invoiceId - (Opcional) ID de la factura a asociar
   * @param uploadedBy - (Opcional) Nombre de usuario (default: "system")
   */
  upload: async (
    file: File,
    invoiceId?: number,
    uploadedBy?: string
  ): Promise<UploadDocumentResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    if (invoiceId !== undefined) {
      formData.append('invoiceId', invoiceId.toString());
    }

    if (uploadedBy) {
      formData.append('uploadedBy', uploadedBy);
    }

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
