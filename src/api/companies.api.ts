import { apiClient } from './client';
import type { Company, CreateCompanyRequest } from '@/types/company.types';

export const companiesApi = {
  // Listar todas las empresas
  list: async (): Promise<Company[]> => {
    const response = await apiClient.get<Company[]>('/companies');
    return response.data;
  },

  // Obtener empresa por ID
  getById: async (id: number): Promise<Company> => {
    const response = await apiClient.get<Company>(`/companies/${id}`);
    return response.data;
  },

  // Crear empresa
  create: async (data: CreateCompanyRequest): Promise<Company> => {
    const response = await apiClient.post<Company>('/companies', data);
    return response.data;
  },

  // Actualizar empresa
  update: async (id: number, data: Partial<CreateCompanyRequest>): Promise<Company> => {
    const response = await apiClient.put<Company>(`/companies/${id}`, data);
    return response.data;
  },

  // Eliminar empresa
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/companies/${id}`);
  },
};
