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

/**
 * Item de factura
 * Estructura según contrato del backend
 */
export interface InvoiceItem {
  id?: number; // Opcional para crear nuevos items
  description: string;
  units: number; // Cantidad de unidades
  price: number; // Precio unitario (BigDecimal en Java)
  vatPercentage: number; // Porcentaje de IVA (ej: 21.0 para 21%)
  discountPercentage: number; // Porcentaje de descuento (ej: 10.0 para 10%)
}

/**
 * Request para crear factura
 * POST /api/invoices
 */
export interface CreateInvoiceRequest {
  companyId: number;
  clientId: number;
  invoiceNumber: string;
  irpfPercentage: number; // Porcentaje de IRPF (ej: 15.0 para 15%)
  rePercentage: number; // Porcentaje de RE (ej: 5.2 para 5.2%)
  notes?: string; // Notas adicionales (opcional)
  items: InvoiceItem[];
}

/**
 * Factura completa
 * GET /api/invoices
 * GET /api/invoices/{id}
 */
export interface Invoice {
  id: number;
  companyId: number;
  clientId: number;
  invoiceNumber: string;
  date: string; // Fecha de emisión ISO-8601: "2025-11-20"
  subtotal: number; // Subtotal sin impuestos (BigDecimal)
  totalVAT: number; // Total IVA (BigDecimal)
  totalIRPF: number; // Total IRPF (negativo, BigDecimal)
  totalRE: number; // Total RE (BigDecimal)
  total: number; // Total final (BigDecimal)
  items: InvoiceItem[];
  notes?: string; // Notas adicionales (opcional)
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
