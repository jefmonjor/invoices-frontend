/**
 * Tipos para Verifactu según contrato API del backend
 * Base URL: /api/verifactu
 */

/**
 * Métricas de Verifactu
 * GET /api/verifactu/metrics
 */
export interface VerifactuMetrics {
  totalInvoices: number;
  acceptedToday: number;
  pendingVerification: number;
  acceptedYesterday: number;
  rejectedCount: number;
  averageVerificationTime: number; // En milisegundos
  lastBatchTime: string; // ISO-8601
}

/**
 * Response de submit invoice
 * POST /api/verifactu/invoices/{invoiceId}/submit
 */
export interface VerifactuSubmitResponse {
  success: boolean;
  message: string;
  invoiceId: number;
  status: string; // PENDING | SENDING | ACCEPTED | REJECTED
}

/**
 * Resumen de batch de verificación
 * GET /api/verifactu/batch/summary
 */
export interface VerifactuBatchSummary {
  batchId: string;
  totalInvoices: number;
  accepted: number;
  rejected: number;
  pending: number;
  startTime: string; // ISO-8601
  endTime: string; // ISO-8601
}
