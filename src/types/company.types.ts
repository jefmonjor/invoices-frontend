export interface Company {
  id: number;
  name: string;
  taxId: string; // CIF/NIF
  address: string;
  phone?: string;
  email: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyRequest {
  name: string;
  taxId: string;
  address: string;
  phone?: string;
  email: string;
}
