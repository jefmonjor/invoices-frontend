import { apiClient } from './client';
import type { AuditLog, AuditLogListParams, PagedResponse } from '@/types/trace.types';

/**
 * API para gestión de logs de auditoría (trazabilidad)
 * Backend: Redis Streams + PostgreSQL
 */
export const tracesApi = {
  /**
   * Listar logs de auditoría con filtros y paginación
   * GET /api/traces
   */
  list: async (params?: AuditLogListParams): Promise<PagedResponse<AuditLog>> => {
    const response = await apiClient.get<PagedResponse<AuditLog>>('/traces', {
      params,
    });
    return response.data;
  },

  /**
   * Obtener un log específico por ID
   * GET /api/traces/{id}
   */
  getById: async (id: number): Promise<AuditLog> => {
    const response = await apiClient.get<AuditLog>(`/traces/${id}`);
    return response.data;
  },

  /**
   * Listar logs de una factura específica
   * GET /api/traces?invoiceId={invoiceId}
   */
  listByInvoice: async (invoiceId: number): Promise<AuditLog[]> => {
    const response = await apiClient.get<AuditLog[]>('/traces', {
      params: { invoiceId },
    });
    return response.data;
  },

  /**
   * Listar logs de un cliente específico
   * GET /api/traces?clientId={clientId}
   */
  listByClient: async (clientId: number): Promise<AuditLog[]> => {
    const response = await apiClient.get<AuditLog[]>('/traces', {
      params: { clientId },
    });
    return response.data;
  },

  /**
   * Listar logs por tipo de evento
   * GET /api/traces?eventType={eventType}
   */
  listByEventType: async (eventType: string): Promise<AuditLog[]> => {
    const response = await apiClient.get<AuditLog[]>('/traces', {
      params: { eventType },
    });
    return response.data;
  },

  /**
   * Listar logs por usuario
   * GET /api/traces?userId={userId}
   */
  listByUser: async (userId: number): Promise<AuditLog[]> => {
    const response = await apiClient.get<AuditLog[]>('/traces', {
      params: { userId },
    });
    return response.data;
  },
};
