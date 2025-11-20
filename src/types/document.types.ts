/**
 * Documento (PDF adjunto a factura)
 * Almacenado en MinIO (dev) / Cloudflare R2 (prod)
 *
 * Estructura según contrato del backend:
 * POST /api/documents - Upload
 * GET /api/documents/{id} - Get metadata
 * GET /api/documents/{id}/download - Download file
 */
export interface Document {
  id: number;
  originalFilename: string; // Nombre original del archivo (backend usa "originalFilename")
  storageKey: string; // Ruta en storage: "documents/2025/11/uuid.pdf"
  fileSize: number; // Tamaño en bytes
  contentType: string; // MIME type: "application/pdf"
  invoiceId: number;
  uploadedBy: string; // Email del usuario que subió (ej: "admin@invoices.com")
  uploadedAt: string; // ISO-8601: "2025-11-20T01:00:00Z"
}

/**
 * Request para subir documento
 * Nota: Se usa FormData en la práctica
 *
 * Form fields:
 * - file (required): PDF file
 * - invoiceId (optional): Invoice ID to associate
 * - uploadedBy (optional): Username (default: "system")
 */
export interface UploadDocumentRequest {
  file: File;
  invoiceId?: number;
  uploadedBy?: string;
}

/**
 * Response al subir documento
 * El backend devuelve la misma estructura que Document
 */
export type UploadDocumentResponse = Document;

/**
 * Parámetros para listar documentos
 */
export interface DocumentListParams {
  invoiceId?: number;
  uploadedBy?: number;
  fileType?: string;
}
