import { z } from 'zod';

/**
 * Validaciones que coinciden con Bean Validation de Spring Boot
 *
 * Esto asegura que las validaciones del frontend sean consistentes
 * con las del backend (@NotNull, @Size, @Min, @Max, etc.)
 */

/**
 * Schema de validación para Invoice Item
 * Coincide con: @Valid InvoiceItem en Java
 */
export const invoiceItemSchema = z.object({
  description: z
    .string()
    .min(1, 'La descripción es requerida')
    .max(500, 'La descripción no puede exceder 500 caracteres'),
  quantity: z
    .number()
    .min(1, 'La cantidad debe ser al menos 1')
    .max(9999, 'La cantidad no puede exceder 9999'),
  unitPrice: z
    .number()
    .min(0.01, 'El precio debe ser mayor a 0')
    .max(999999.99, 'El precio es demasiado alto'),
  taxRate: z
    .number()
    .min(0, 'La tasa de impuesto no puede ser negativa')
    .max(100, 'La tasa de impuesto no puede exceder 100%'),
});

/**
 * Schema de validación para crear Invoice
 * Coincide con: CreateInvoiceRequest en Java
 */
export const createInvoiceSchema = z.object({
  invoiceNumber: z
    .string()
    .min(1, 'El número de factura es requerido')
    .max(50, 'El número de factura no puede exceder 50 caracteres')
    .regex(/^[A-Z0-9-]+$/, 'Formato inválido (solo mayúsculas, números y guiones)'),
  companyId: z.number().min(1, 'Debe seleccionar una empresa'),
  clientId: z.number().min(1, 'Debe seleccionar un cliente'),
  issueDate: z.string().min(1, 'La fecha de emisión es requerida'),
  dueDate: z.string().min(1, 'La fecha de vencimiento es requerida'),
  items: z
    .array(invoiceItemSchema)
    .min(1, 'Debe agregar al menos un ítem')
    .max(100, 'No puede agregar más de 100 ítems'),
});

/**
 * Type inference de Zod schemas
 */
export type InvoiceItemFormData = z.infer<typeof invoiceItemSchema>;
export type CreateInvoiceFormData = z.infer<typeof createInvoiceSchema>;

/**
 * Validador personalizado para fechas
 * Asegura que dueDate >= issueDate
 */
export const validateDates = (issueDate: string, dueDate: string): boolean => {
  const issue = new Date(issueDate);
  const due = new Date(dueDate);
  return due >= issue;
};

// Additional validators for edge cases
export const errorMessages = {
  required: 'Este campo es requerido',
  invalidEmail: 'Email inválido',
  minLength: (min: number) => `Debe tener al menos ${min} caracteres`,
  maxLength: (max: number) => `Debe tener máximo ${max} caracteres`,
  invalidTaxId: 'CIF/NIF inválido',
  invalidPhone: 'Teléfono inválido',
};

// Spanish Tax ID validation
export const validateSpanishTaxId = (value: string): boolean => {
  if (!value) return false;
  const cifRegex = /^[A-HJ-NP-SUVW]\d{7}[0-9A-J]$/;
  const nifRegex = /^\d{8}[A-Z]$/;
  const nieRegex = /^[XYZ]\d{7}[A-Z]$/;
  return cifRegex.test(value) || nifRegex.test(value) || nieRegex.test(value);
};

// Phone validation (international format)
export const validatePhone = (value: string): boolean => {
  if (!value) return true; // Optional
  const phoneRegex = /^\+?[\d\s\-()]{9,}$/;
  return phoneRegex.test(value);
};

// Sanitize input to prevent XSS
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Validate number range
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

// Debounce utility function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
};
