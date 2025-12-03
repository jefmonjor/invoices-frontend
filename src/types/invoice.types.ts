/**
 * Tipos para facturas según contrato OpenAPI del backend
 * Compatible con Spring Boot 3 + Java 21
 */

/**
 * IMPORTANTE - Manejo de BigDecimal de Java:
 *
 * Java usa BigDecimal para montos (baseAmount, totalAmount, etc).
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

// ==================== DTOs de soporte ====================

export interface ClientDTO {
  id: number;
  businessName: string;
  taxId: string;
  address: string;
  city: string;
  postalCode: string;
  province: string;
  phone: string;
  email: string;
}

export interface CompanyDTO {
  id: number;
  businessName: string;
  taxId: string;
  address: string;
  city: string;
  postalCode: string;
  province: string;
  phone: string;
  email: string;
  iban: string;
}

// ==================== Invoice Item ====================

/**
 * Item de factura según InvoiceItemDTO
 * IMPORTANT: Nombres de campos alineados con contrato del backend:
 * - quantity (no "units")
 * - unitPrice (no "price")
 * - taxRate (no "vatPercentage")
 */
export interface InvoiceItem {
  id?: number; // Opcional al crear
  invoiceId?: number;
  description: string;
  quantity: number; // Cantidad (antes: units)
  unitPrice: number; // Precio unitario (antes: price)
  taxRate: number; // Porcentaje de IVA (antes: vatPercentage)
  discountPercentage?: number;
  subtotal?: number; // Calculado por backend
  total?: number; // Calculado por backend
  // Campos adicionales para facturas de transporte
  itemDate?: string; // ISO-8601 date (YYYY-MM-DD)
  vehiclePlate?: string; // Matrícula del vehículo
  orderNumber?: string; // Número de pedido
  zone?: string; // Zona (ej: CDF 11, CDF 12)
  gasPercentage?: number; // Porcentaje de gas
  createdAt?: string; // ISO-8601
  updatedAt?: string; // ISO-8601
}

/**
 * Request para crear items (usado en CreateInvoiceRequest)
 */
export interface CreateInvoiceItemRequest {
  description: string;
  quantity: number; // Cantidad (antes: units)
  unitPrice: number; // Precio unitario (antes: price)
  taxRate: number; // Porcentaje de IVA (antes: vatPercentage)
  discountPercentage?: number;
  // Campos adicionales para facturas de transporte
  itemDate?: string; // ISO-8601 date (YYYY-MM-DD)
  vehiclePlate?: string; // Matrícula del vehículo
  orderNumber?: string; // Número de pedido
  zone?: string; // Zona (ej: CDF 11, CDF 12)
  gasPercentage?: number; // Porcentaje de gas
}

// ==================== Invoice ====================

/**
 * Factura completa según InvoiceDTO
 * GET /invoices
 * GET /invoices/{id}
 */
export interface Invoice {
  id: number;
  companyId: number;
  clientId: number;
  company?: CompanyDTO; // Poblado en respuestas del backend
  client?: ClientDTO; // Poblado en respuestas del backend
  invoiceNumber: string;
  settlementNumber?: string; // Número de liquidación (opcional)
  issueDate: string; // ISO-8601 date-time
  baseAmount: number; // Subtotal sin impuestos
  irpfPercentage: number;
  irpfAmount: number; // Calculado por backend
  rePercentage: number;
  reAmount: number; // Calculado por backend
  totalAmount: number; // Total final
  status: string; // Estado de la factura
  verifactuStatus?: string; // Estado VeriFactu (pending, processing, accepted, rejected)
  documentHash?: string; // Hash SHA-256 del PDF
  pdfServerPath?: string; // Ruta del PDF en MinIO
  documentJson?: string; // JSON enviado a VeriFactu
  verifactuTxId?: string; // ID de transacción VeriFactu
  verifactuError?: string; // Mensaje de error si falló
  pdfIsFinal?: boolean; // Si el PDF es definitivo (con huella)
  notes?: string;
  createdAt: string; // ISO-8601
  updatedAt: string; // ISO-8601
  items: InvoiceItem[];
}

/**
 * Request para crear factura
 * POST /invoices
 */
export interface CreateInvoiceRequest {
  companyId: number;
  clientId: number;
  invoiceNumber: string;
  settlementNumber?: string; // Número de liquidación (opcional, para facturas de transporte)
  irpfPercentage?: number; // Default 0
  rePercentage?: number; // Default 0
  notes?: string;
  items: CreateInvoiceItemRequest[];
}

/**
 * Request para act ualizar factura
 * PUT /invoices/{id}
 *
 * Campos inmutables (validados por el backend - se rechaza el cambio):
 * - companyId
 * - invoiceNumber
 *
 * Campos actualizables:
 * - clientId: Actualizable (el backend valida que el cliente exista)
 * - irpfPercentage: Actualizable (afecta los cálculos de la factura)
 * - rePercentage: Actualizable (afecta los cálculos de la factura)
 * - settlementNumber: Actualizable
 * - notes: Actualizable  
 * - items: Actualizable (reemplaza todos los items)
 */
export interface UpdateInvoiceRequest {
  // Campos inmutables - validados por backend
  companyId?: number;
  invoiceNumber?: string;

  // Campos actualizables
  clientId?: number;
  irpfPercentage?: number;
  rePercentage?: number;
  settlementNumber?: string;
  notes?: string;
  items?: CreateInvoiceItemRequest[];
}

// ==================== Paginación y Filtros ====================

export interface InvoiceListParams {
  page?: number; // 0-based
  size?: number; // Default: 20
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  status?: string;
  clientId?: number;
}

/**
 * Interfaz exacta de Spring Boot 3 - Page<T>
 */
export interface PagedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
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
 * Interfaz simplificada para uso en componentes
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
