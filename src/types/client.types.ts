export interface Client {
  id: number;
  name: string;
  taxId: string; // CIF/NIF
  address: string;
  phone?: string;
  email: string;
  contactPerson?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientRequest {
  name: string;
  taxId: string;
  address: string;
  phone?: string;
  email: string;
  contactPerson?: string;
}
