/**
 * Client según ClientDTO del backend
 * Compatible con Spring Boot 3 + Java 21
 */
export interface Client {
  id: number;
  businessName: string; // Razón social (antes 'name')
  taxId: string; // CIF/NIF
  address: string;
  city: string;
  postalCode: string;
  province: string;
  country?: string; // País (opcional)
  phone: string;
  email: string;
  companyId?: number; // ID de la empresa asociada
  createdAt?: string; // ISO-8601
  updatedAt?: string; // ISO-8601
}

/**
 * Request para crear/actualizar cliente
 */
export interface CreateClientRequest {
  businessName: string;
  taxId: string;
  address: string;
  city: string;
  postalCode: string;
  province: string;
  phone: string;
  email: string;
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
