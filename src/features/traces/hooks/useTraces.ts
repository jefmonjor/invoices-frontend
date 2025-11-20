import { useQuery } from '@tanstack/react-query';
import { tracesApi } from '@/api/traces.api';
import type { AuditLogListParams, EventType } from '@/types/trace.types';

/**
 * Query keys para React Query cache
 */
export const traceKeys = {
  all: ['traces'] as const,
  lists: () => [...traceKeys.all, 'list'] as const,
  list: (params?: AuditLogListParams) => [...traceKeys.lists(), params] as const,
  details: () => [...traceKeys.all, 'detail'] as const,
  detail: (id: number) => [...traceKeys.details(), id] as const,
  byInvoice: (invoiceId: number) => [...traceKeys.all, 'invoice', invoiceId] as const,
  byClient: (clientId: number) => [...traceKeys.all, 'client', clientId] as const,
  byUser: (userId: number) => [...traceKeys.all, 'user', userId] as const,
  byEventType: (eventType: EventType) => [...traceKeys.all, 'event', eventType] as const,
};

/**
 * Hook para obtener lista de logs con paginación y filtros
 */
export const useTraces = (params?: AuditLogListParams) => {
  return useQuery({
    queryKey: traceKeys.list(params),
    queryFn: () => tracesApi.list(params),
    staleTime: 1000 * 60 * 2, // 2 minutos (datos de auditoría cambian frecuentemente)
    gcTime: 1000 * 60 * 5, // 5 minutos en cache
  });
};

/**
 * Hook para obtener un log específico por ID
 */
export const useTrace = (id: number) => {
  return useQuery({
    queryKey: traceKeys.detail(id),
    queryFn: () => tracesApi.getById(id),
    enabled: !!id && id > 0,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

/**
 * Hook para obtener logs de una factura
 * Útil para mostrar timeline de eventos en detalle de factura
 */
export const useTracesByInvoice = (invoiceId: number) => {
  return useQuery({
    queryKey: traceKeys.byInvoice(invoiceId),
    queryFn: () => tracesApi.listByInvoice(invoiceId),
    enabled: !!invoiceId && invoiceId > 0,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
};

/**
 * Hook para obtener logs de un cliente
 * Útil para ver historial de interacciones con un cliente
 */
export const useTracesByClient = (clientId: number) => {
  return useQuery({
    queryKey: traceKeys.byClient(clientId),
    queryFn: () => tracesApi.listByClient(clientId),
    enabled: !!clientId && clientId > 0,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
};

/**
 * Hook para obtener logs de un usuario
 * Útil para auditoría de acciones de un usuario específico
 */
export const useTracesByUser = (userId: number) => {
  return useQuery({
    queryKey: traceKeys.byUser(userId),
    queryFn: () => tracesApi.listByUser(userId),
    enabled: !!userId && userId > 0,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
};

/**
 * Hook para obtener logs por tipo de evento
 * Útil para filtrar eventos específicos (ej: todos los logins)
 */
export const useTracesByEventType = (eventType: EventType) => {
  return useQuery({
    queryKey: traceKeys.byEventType(eventType),
    queryFn: () => tracesApi.listByEventType(eventType),
    enabled: !!eventType,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
};

/**
 * Hook para obtener actividad reciente
 * Útil para dashboard de administración
 */
export const useRecentTraces = (limit: number = 10) => {
  return useQuery({
    queryKey: [...traceKeys.lists(), 'recent', limit],
    queryFn: () =>
      tracesApi.list({
        page: 0,
        size: limit,
        sortBy: 'createdAt',
        sortDir: 'DESC',
      }),
    staleTime: 1000 * 30, // 30 segundos (para mostrar actividad casi en tiempo real)
    refetchInterval: 1000 * 60, // Refetch cada minuto
  });
};
