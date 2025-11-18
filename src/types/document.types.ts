/**
 * Documento (PDF adjunto a factura)
 * Almacenado en MinIO (dev) / Cloudflare R2 (prod)
 */
export interface Document {
  id: number;
  fileName: string;
  originalFileName: string;
  fileSize: number; // En bytes
  fileType: string; // MIME type, ej: "application/pdf"
  storageUrl: string; // URL en MinIO/R2
  invoiceId: number;
  uploadedBy: number; // User ID
  uploadedByName?: string; // Nombre del usuario (opcional)
  createdAt: string; // ISO-8601
  updatedAt: string; // ISO-8601
}

/**
 * Request para subir documento
 * Nota: En realidad se usa FormData, pero este tipo es para documentación
 */
export interface UploadDocumentRequest {
  file: File;
  invoiceId: number;
}

/**
 * Response al subir documento
 */
export interface UploadDocumentResponse {
  id: number;
  fileName: string;
  fileSize: number;
  storageUrl: string;
  message?: string;
}

/**
 * Parámetros para listar documentos
 */
export interface DocumentListParams {
  invoiceId?: number;
  uploadedBy?: number;
  fileType?: string;
}
