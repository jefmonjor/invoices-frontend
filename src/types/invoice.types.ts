/**
 * Tipos para facturas
 * Compatible con Spring Boot 3 + Java 21
 */

/**
 * IMPORTANTE - Manejo de BigDecimal de Java:
 *
 * Java usa BigDecimal para montos (subtotal, taxAmount, totalAmount).
 * Spring Boot serializa BigDecimal como number en JSON.
 *
 * ⚠️ PRECAUCIÓN: JavaScript tiene problemas de precisión con decimales
 * Ejemplo: 0.1 + 0.2 = 0.30000000000000004
 *
 * SOLUCIONES:
 * 1. Para VISUALIZACIÓN: usar number y formatear con Intl.NumberFormat
 * 2. Para CÁLCULOS: NO hacer cálculos complejos en frontend, confiar en backend
 * 3. Si necesitas cálculos: usar librería como currency.js
 *
 * En este proyecto: Los cálculos se hacen en el BACKEND (Java BigDecimal),
 * el frontend solo visualiza y envía valores al backend.
 */

export interface InvoiceItem {
  id?: number; // Opcional para crear nuevos items
  description: string;
  quantity: number;
  unitPrice: number; // BigDecimal en Java → number en TS (solo para visualizar)
  taxRate: number;   // Porcentaje (ej: 21.0 para 21%)
  total?: number;    // Calculado por el backend
}

export interface CreateInvoiceRequest {
  invoiceNumber: string;
  companyId: number;
  clientId: number;
  issueDate: string;  // ISO-8601: "2025-11-17" (LocalDate en Java)
  dueDate: string;    // ISO-8601: "2025-12-17"
  items: InvoiceItem[];
}

export interface Invoice {
  id: number;  // Long en Java - Compatible si < 9,007,199,254,740,991
  invoiceNumber: string;
  companyId: number;
  clientId: number;
  issueDate: string;      // ISO-8601: "2025-11-17T10:30:00"
  dueDate: string;        // ISO-8601: "2025-12-17T23:59:59"
  status: 'DRAFT' | 'PENDING' | 'PAID' | 'CANCELLED'; // Debe coincidir con Java Enum
  subtotal: number;       // BigDecimal en Java → number en TS
  taxAmount: number;      // BigDecimal en Java → number en TS
  totalAmount: number;
  items: InvoiceItem[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceListParams {
  page?: number;         // Número de página (0-based en Spring)
  size?: number;         // Tamaño de página (default: 20)
  sortBy?: string;       // Campo para ordenar (ej: "invoiceNumber")
  sortDir?: 'asc' | 'desc';  // Dirección de ordenamiento
  status?: string;       // Filtro por estado
  clientId?: number;     // Filtro por cliente
}

/**
 * Interfaz exacta de Spring Boot 3 - Page<T>
 *
 * Spring Data devuelve esta estructura al usar Pageable.
 * Jackson serializa automáticamente con estos nombres de campos.
 */
export interface PagedResponse<T> {
  content: T[];              // Array de elementos de la página actual
  pageable: {
    pageNumber: number;      // Número de página actual (0-based)
    pageSize: number;        // Tamaño de página
    offset: number;          // Offset total
    paged: boolean;
    unpaged: boolean;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
  };
  totalPages: number;        // Total de páginas
  totalElements: number;     // Total de elementos en todas las páginas
  last: boolean;             // ¿Es la última página?
  first: boolean;            // ¿Es la primera página?
  size: number;              // Tamaño de página
  number: number;            // Número de página actual (0-based)
  numberOfElements: number;  // Número de elementos en esta página
  empty: boolean;            // ¿Está vacía la página?
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
}

/**
 * Interfaz simplificada para uso en componentes
 * (extrae solo lo necesario de PagedResponse)
 */
export interface SimplePage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;  // number (0-based de Spring)
  size: number;
  isLast: boolean;
  isFirst: boolean;
}

/**
 * Helper para convertir PagedResponse a SimplePage
 */
export const toSimplePage = <T>(page: PagedResponse<T>): SimplePage<T> => ({
  content: page.content,
  totalElements: page.totalElements,
  totalPages: page.totalPages,
  currentPage: page.number,
  size: page.size,
  isLast: page.last,
  isFirst: page.first,
});
