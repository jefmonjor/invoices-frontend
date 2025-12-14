/**
 * Client según ClientDTO del backend
 * Compatible con Spring Boot 3 + Java 21
 */
export interface Client {
  id: number;
  businessName: string; // Razón social - OBLIGATORIO
  taxId: string; // CIF/NIF - OBLIGATORIO
  address: string; // OBLIGATORIO
  city?: string; // Opcional
  postalCode?: string; // Opcional
  province?: string; // Opcional
  country?: string; // País (opcional, default: España)
  phone?: string; // Opcional
  email?: string; // Opcional
  companyId?: number; // ID de la empresa asociada
  createdAt?: string; // ISO-8601
  updatedAt?: string; // ISO-8601
}

/**
 * Request para crear/actualizar cliente
 * Solo businessName, taxId, address son obligatorios
 */
export interface CreateClientRequest {
  businessName: string;
  taxId: string;
  address: string;
  city?: string;
  postalCode?: string;
  province?: string;
  phone?: string;
  email?: string;
}

export interface UpdateClientRequest {
  businessName?: string;
  taxId?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  province?: string;
  phone?: string;
  email?: string;
}
