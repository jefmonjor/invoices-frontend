import { apiClient } from './client';
import type {
  VerifactuMetrics,
  VerifactuSubmitResponse,
  VerifactuBatchSummary,
} from '@/types/verifactu.types';

/**
 * API para Verifactu (sistema de verificación de facturas de AEAT)
 * Base URL: /api/verifactu
 */
export const verifactuApi = {
  /**
   * Obtener métricas de Verifactu
   * GET /api/verifactu/metrics
   */
  getMetrics: async (): Promise<VerifactuMetrics> => {
    const response = await apiClient.get<VerifactuMetrics>('/api/verifactu/metrics');
    return response.data;
  },

  /**
   * Enviar factura para verificación
   * POST /api/verifactu/invoices/{invoiceId}/submit
   */
  submitInvoice: async (invoiceId: number): Promise<VerifactuSubmitResponse> => {
    const response = await apiClient.post<VerifactuSubmitResponse>(
      `/api/verifactu/invoices/${invoiceId}/submit`
    );
    return response.data;
  },

  /**
   * Obtener resumen del último batch de verificación
   * GET /api/verifactu/batch/summary
   */
  getBatchSummary: async (): Promise<VerifactuBatchSummary> => {
    const response = await apiClient.get<VerifactuBatchSummary>('/api/verifactu/batch/summary');
    return response.data;
  },
};
