import { apiClient } from './client';
import type {
  VerifactuMetrics,
  VerifactuSubmitResponse,
  VerifactuBatchSummary,
} from '@/types/verifactu.types';

/**
 * Estado del certificado de una empresa
 */
export interface CertificateStatus {
  configured: boolean;
  status: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' | 'NOT_CONFIGURED';
  subject?: string;
  issuer?: string;
  validFrom?: string;
  validUntil?: string;
  serialNumber?: string;
  daysUntilExpiration?: number;
}

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
   * Enviar factura para verificación VeriFactu
   * POST /api/verifactu/invoices/{invoiceId}/send
   * @param invoiceId - ID de la factura
   * @param companyId - ID de la empresa (requerido por backend)
   */
  submitInvoice: async (invoiceId: number, companyId: number): Promise<VerifactuSubmitResponse> => {
    const response = await apiClient.post<VerifactuSubmitResponse>(
      `/api/verifactu/invoices/${invoiceId}/send`,
      null,
      { params: { companyId } }
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

  /**
   * Obtener estado del certificado de una empresa
   * GET /api/verifactu/certificates/status
   * @param companyId - ID de la empresa
   */
  getCertificateStatus: async (companyId: number): Promise<CertificateStatus> => {
    const response = await apiClient.get<CertificateStatus>(
      '/api/verifactu/certificates/status',
      { params: { companyId } }
    );
    return response.data;
  },

  /**
   * Subir certificado P12/PFX para firma digital VeriFactu
   * POST /api/verifactu/certificates/upload
   * @param companyId - ID de la empresa
   * @param file - Archivo de certificado (.p12 o .pfx)
   * @param password - Contraseña del certificado
   */
  uploadCertificate: async (companyId: number, file: File, password: string): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);

    // companyId y password van como query params (@RequestParam), no en FormData
    await apiClient.post('/api/verifactu/certificates/upload', formData, {
      params: {
        companyId,
        password,
      },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

