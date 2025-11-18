/**
 * Tipos de eventos de auditoría
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
 * Tipo de entidad siendo auditada
 */
export type EntityType = 'Invoice' | 'Document' | 'User' | 'Client' | 'Company';

/**
 * Tipo de acción realizada
 */
export type ActionType = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'DOWNLOAD' | 'GENERATE';

/**
 * Log de auditoría individual
 */
export interface AuditLog {
  id: number;
  eventType: EventType;
  userId: number;
  username: string;
  userEmail?: string;
  entityType: EntityType;
  entityId: number;
  action: ActionType;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>; // JSON adicional con detalles
  timestamp: string; // ISO-8601, ej: "2025-11-18T10:30:00Z"
  createdAt: string; // ISO-8601
}

/**
 * Parámetros para listar logs de auditoría
 */
export interface AuditLogListParams {
  // Paginación
  page?: number;
  size?: number;
  sort?: string; // ej: "timestamp,desc"

  // Filtros por entidad
  invoiceId?: number;
  clientId?: number;
  companyId?: number;
  userId?: number;

  // Filtros por tipo
  eventType?: EventType;
  entityType?: EntityType;
  action?: ActionType;

  // Filtros por fecha
  startDate?: string; // ISO-8601
  endDate?: string; // ISO-8601

  // Búsqueda
  search?: string; // Búsqueda en description
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
