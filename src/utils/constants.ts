/**
 * Constantes que coinciden con el backend Java
 */

/**
 * Estados de factura (debe coincidir con InvoiceStatus enum en Java)
 */
export const INVOICE_STATUS = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
} as const;

export type InvoiceStatus = (typeof INVOICE_STATUS)[keyof typeof INVOICE_STATUS];

/**
 * Roles de usuario (debe coincidir con UserRole enum en Java)
 */
export const USER_ROLES = {
  PLATFORM_ADMIN: 'ROLE_PLATFORM_ADMIN',
  ADMIN: 'ROLE_ADMIN',
  USER: 'ROLE_USER',
  CLIENT: 'ROLE_CLIENT',
} as const;

/**
 * Configuración de paginación (debe coincidir con defaults de Spring Boot)
 */
export const PAGINATION = {
  DEFAULT_PAGE: 0,        // Spring usa 0-based
  DEFAULT_SIZE: 20,       // Default en Spring Boot
  MAX_SIZE: 100,          // Máximo permitido
} as const;

/**
 * Configuración de moneda
 */
export const CURRENCY = {
  CODE: 'USD',
  SYMBOL: '$',
  LOCALE: 'es-ES',
} as const;
