/**
 * Company según CompanyDTO del backend
 * Compatible con Spring Boot 3 + Java 21
 */
export interface Company {
  id: number;
  businessName: string; // Razón social - OBLIGATORIO
  taxId: string; // CIF - OBLIGATORIO
  address: string; // OBLIGATORIO
  city?: string; // Opcional
  postalCode?: string; // Opcional
  province?: string; // Opcional
  phone?: string; // Opcional
  email?: string; // Opcional
  iban?: string; // Cuenta bancaria - Opcional
  logoUrl?: string; // URL del logo - Opcional
  createdAt?: string; // ISO-8601
  updatedAt?: string; // ISO-8601
  // User specific fields (from CompanyDto)
  role?: 'ADMIN' | 'USER';
  isDefault?: boolean;
}

/**
 * Request para crear/actualizar empresa
 * REQUIRED: businessName, taxId, address
 * OPTIONAL: all other fields
 */
export interface CreateCompanyRequest {
  businessName: string;
  taxId: string;
  address: string;
  city?: string;
  postalCode?: string;
  province?: string;
  phone?: string;
  email?: string;
  iban?: string;
}

export interface UpdateCompanyRequest {
  businessName?: string;
  taxId?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  province?: string;
  phone?: string;
  email?: string;
  iban?: string;
}

export interface CompanyUser {
  userId: number;
  name: string;
  email: string;
  role: string; // 'ADMIN' | 'USER'
  joinedAt?: string;
}
