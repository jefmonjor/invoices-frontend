import type { UseFormSetError } from 'react-hook-form';
import { AxiosError } from 'axios';

/**
 * Estructura de error de Spring Boot 3 con Bean Validation
 *
 * Cuando falla @Valid en el controller, Spring devuelve esta estructura
 */
export interface SpringValidationError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  errors?: Array<{
    field: string;           // Nombre del campo (ej: "items[0].quantity")
    defaultMessage: string;  // Mensaje de error
    objectName: string;      // Nombre del objeto (ej: "createInvoiceRequest")
    code: string;            // Código de error (ej: "NotNull", "Min")
    rejectedValue?: any;     // Valor rechazado
  }>;
}

/**
 * Alternativa: Algunos backends devuelven errores como mapa
 */
export interface SpringFieldErrors {
  [fieldName: string]: string;
}

/**
 * Helper para setear errores de Spring en React Hook Form
 *
 * @param error Error de Axios con respuesta de Spring
 * @param setError Función setError de React Hook Form
 */
export const setSpringErrors = (
  error: unknown,
  setError: UseFormSetError<any>
) => {
  if (!(error instanceof AxiosError)) return;

  const data = error.response?.data as SpringValidationError;

  // Caso 1: Spring Boot con lista de errores (Bean Validation)
  if (data?.errors && Array.isArray(data.errors)) {
    data.errors.forEach((err) => {
      setError(err.field, {
        type: 'server',
        message: err.defaultMessage,
      });
    });
    return;
  }

  // Caso 2: Mapa de errores { "fieldName": "message" }
  if (data && typeof data === 'object') {
    Object.entries(data).forEach(([field, message]) => {
      if (typeof message === 'string') {
        setError(field, {
          type: 'server',
          message,
        });
      }
    });
  }
};

/**
 * Helper para extraer mensaje de error general de Spring
 */
export const getSpringErrorMessage = (error: unknown): string => {
  if (!(error instanceof AxiosError)) {
    return 'Error desconocido';
  }

  const data = error.response?.data as SpringValidationError;

  // Mensaje principal del error
  if (data?.message) {
    return data.message;
  }

  // Si hay errores de validación, mostrar el primero
  if (data?.errors && data.errors.length > 0) {
    return data.errors[0].defaultMessage;
  }

  return error.message || 'Error en la petición';
};
