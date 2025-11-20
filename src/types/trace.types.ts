/**
 * Tipos de eventos de auditoría
 * Según contrato del backend
 */
export type EventType =
  // Eventos de Facturas
  | 'INVOICE_CREATED'
  | 'INVOICE_UPDATED'
  | 'INVOICE_DELETED'
  | 'INVOICE_PAID'
  | 'INVOICE_CANCELLED'
  | 'INVOICE_PDF_GENERATED'
  // Eventos de Documentos
  | 'DOCUMENT_UPLOADED'
  | 'DOCUMENT_DOWNLOADED'
  | 'DOCUMENT_DELETED'
  // Eventos de Usuarios
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DELETED'
  | 'USER_PASSWORD_CHANGED'
  // Eventos de Clientes
  | 'CLIENT_CREATED'
  | 'CLIENT_UPDATED'
  | 'CLIENT_DELETED'
  // Eventos de Empresas
  | 'COMPANY_CREATED'
  | 'COMPANY_UPDATED'
  | 'COMPANY_DELETED';

/**
 * Log de auditoría individual
 * Estructura según contrato del backend:
 * GET /api/traces - List with filters
 * GET /api/traces/{id} - Get by ID
 *
 * Respuesta del backend:
 * {
 *   "id": 1,
 *   "invoiceId": 1,
 *   "clientId": 1,
 *   "eventType": "INVOICE_CREATED",
 *   "eventData": "{...}",
 *   "createdAt": "2025-11-20T01:00:00Z"
 * }
 */
export interface AuditLog {
  id: number;
  invoiceId?: number | null;
  clientId?: number | null;
  eventType: EventType;
  eventData?: string; // JSON string con datos adicionales
  createdAt: string; // ISO-8601: "2025-11-20T01:00:00Z"
}

/**
 * Parámetros para listar logs de auditoría
 * Según contrato del backend:
 * GET /api/traces?invoiceId={id}&clientId={id}&eventType={type}&page=0&size=20&sortBy=createdAt&sortDir=DESC
 */
export interface AuditLogListParams {
  // Paginación
  page?: number; // Default: 0
  size?: number; // Default: 20
  sortBy?: string; // Campo para ordenar (default: createdAt)
  sortDir?: 'ASC' | 'DESC'; // Default: DESC

  // Filtros por entidad
  invoiceId?: number;
  clientId?: number;

  // Filtros por tipo
  eventType?: EventType;
}

/**
 * Respuesta paginada de Spring Boot
 * Compatible con PagedResponse del backend
 */
export interface PagedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
}

/**
 * Helper para respuesta paginada simplificada
 */
export interface SimplePage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
  isLast: boolean;
  isFirst: boolean;
}

/**
 * Estadísticas de auditoría
 * Útil para dashboards de administración
 */
export interface AuditStats {
  totalEvents: number;
  eventsByType: Record<EventType, number>;
  eventsByUser: Array<{
    userId: number;
    username: string;
    count: number;
  }>;
  recentActivity: AuditLog[];
}
