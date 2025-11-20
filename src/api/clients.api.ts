import { apiClient } from './client';
import type { Client, CreateClientRequest } from '@/types/client.types';

export const clientsApi = {
  // Listar todos los clientes
  list: async (): Promise<Client[]> => {
    const response = await apiClient.get<Client[]>('/api/clients');
    return response.data;
  },

  // Obtener cliente por ID
  getById: async (id: number): Promise<Client> => {
    const response = await apiClient.get<Client>(`/api/clients/${id}`);
    return response.data;
  },

  // Crear cliente
  create: async (data: CreateClientRequest): Promise<Client> => {
    const response = await apiClient.post<Client>('/api/clients', data);
    return response.data;
  },

  // Actualizar cliente
  update: async (id: number, data: Partial<CreateClientRequest>): Promise<Client> => {
    const response = await apiClient.put<Client>(`/api/clients/${id}`, data);
    return response.data;
  },

  // Eliminar cliente
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/clients/${id}`);
  },
};
