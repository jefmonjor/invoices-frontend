/**
 * Utilidades para generar números de factura automáticos
 */

/**
 * Genera un número de factura con formato: XXX/YYYY
 * donde XXX es un contador secuencial y YYYY es el año actual
 *
 * @param lastInvoiceNumber - Último número de factura usado (opcional)
 * @param prefix - Prefijo opcional (ej: "A", "F", "")
 * @returns Número de factura generado (ej: "A057/2025", "047/2025")
 */
export const generateInvoiceNumber = (
  lastInvoiceNumber?: string,
  prefix: string = ''
): string => {
  const currentYear = new Date().getFullYear();

  // Intentar extraer el último número del formato XXX/YYYY o AXXX/YYYY
  let nextNumber = 1;

  if (lastInvoiceNumber) {
    // Buscar patrón: opcional(letra) + número + / + año
    const match = lastInvoiceNumber.match(/([A-Z])?(\d+)\/(\d{4})/);
    if (match) {
      const lastNum = parseInt(match[2], 10);
      const lastYear = parseInt(match[3], 10);

      // Si es del mismo año, incrementar; si no, empezar desde 1
      if (lastYear === currentYear) {
        nextNumber = lastNum + 1;
      }
    }
  }

  // Formatear con padding de 3 dígitos
  const paddedNumber = nextNumber.toString().padStart(3, '0');

  return `${prefix}${paddedNumber}/${currentYear}`;
};

/**
 * Genera sugerencias de números de factura
 * @returns Array de sugerencias
 */
export const generateInvoiceSuggestions = (): string[] => {
  const currentYear = new Date().getFullYear();
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');

  return [
    generateInvoiceNumber(undefined, ''), // 001/2025
    generateInvoiceNumber(undefined, 'A'), // A001/2025
    generateInvoiceNumber(undefined, 'F'), // F001/2025
    `INV-${currentYear}-${currentMonth}-001`, // INV-2025-01-001
    `FACT-${currentYear}-001`, // FACT-2025-001
  ];
};

/**
 * Valida si un número de factura tiene formato válido
 * @param invoiceNumber - Número de factura a validar
 * @returns true si es válido
 */
export const isValidInvoiceNumber = (invoiceNumber: string): boolean => {
  // Regex del backend: ^[A-Za-z0-9./-]+$
  return /^[A-Za-z0-9./-]+$/.test(invoiceNumber);
};
