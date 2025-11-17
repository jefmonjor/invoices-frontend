/**
 * Formateadores para datos de Spring Boot
 * Compatible con BigDecimal, LocalDateTime, LocalDate
 */

/**
 * Formatea montos (BigDecimal de Java → number en TS)
 *
 * IMPORTANTE: Este formateador es SOLO para visualización.
 * NO uses los valores formateados para cálculos.
 *
 * @param amount Monto como number
 * @param currency Código de moneda (ISO 4217)
 * @param locale Locale para formateo
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'es-ES'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formatea número con separadores de miles
 *
 * @param value Número a formatear
 * @param decimals Cantidad de decimales (default: 2)
 */
export const formatNumber = (value: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Formatea fecha ISO-8601 de Spring Boot a formato legible
 *
 * Spring serializa LocalDateTime como: "2025-11-17T10:30:00"
 * Spring serializa LocalDate como: "2025-11-17"
 *
 * @param isoDate String ISO-8601 de Spring
 * @param includeTime Incluir hora en el formato
 */
export const formatDate = (
  isoDate: string,
  includeTime: boolean = false
): string => {
  const date = new Date(isoDate);

  if (includeTime) {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  }

  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

/**
 * Convierte Date a formato ISO-8601 para enviar a Spring Boot
 *
 * Para LocalDateTime en Java: "2025-11-17T10:30:00"
 * Para LocalDate en Java: "2025-11-17"
 *
 * @param date Objeto Date de JavaScript
 * @param dateOnly Solo fecha (sin hora)
 */
export const toISODate = (date: Date, dateOnly: boolean = false): string => {
  if (dateOnly) {
    // LocalDate en Java: "2025-11-17"
    return date.toISOString().split('T')[0];
  }

  // LocalDateTime en Java: "2025-11-17T10:30:00"
  // Nota: Remover milisegundos y zona horaria
  return date.toISOString().split('.')[0];
};

/**
 * Formatea el estado de la factura (Enum de Java)
 */
export const formatInvoiceStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    DRAFT: 'Borrador',
    PENDING: 'Pendiente',
    PAID: 'Pagada',
    CANCELLED: 'Cancelada',
  };

  return statusMap[status] || status;
};

/**
 * Obtiene color para el estado de factura (útil para badges)
 */
export const getStatusColor = (
  status: string
): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' => {
  const colorMap: Record<string, any> = {
    DRAFT: 'default',
    PENDING: 'warning',
    PAID: 'success',
    CANCELLED: 'error',
  };

  return colorMap[status] || 'default';
};
