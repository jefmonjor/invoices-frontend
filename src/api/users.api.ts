import { apiClient } from './client';
import type { User, CreateUserRequest, UpdateUserRequest, PagedUsers, UserListParams } from '@/types/user.types';

export const usersApi = {
  /**
   * Obtiene lista paginada de usuarios
   */
  async list(params?: UserListParams): Promise<PagedUsers> {
    const response = await apiClient.get<PagedUsers>('/api/users', { params });
    return response.data;
  },

  /**
   * Obtiene un usuario por ID
   */
  async getById(id: number): Promise<User> {
    const response = await apiClient.get<User>(`/api/users/${id}`);
    return response.data;
  },

  /**
   * Crea un nuevo usuario
   */
  async create(data: CreateUserRequest): Promise<User> {
    const response = await apiClient.post<User>('/api/users', data);
    return response.data;
  },

  /**
   * Actualiza un usuario existente
   */
  async update(id: number, data: UpdateUserRequest): Promise<User> {
    const response = await apiClient.put<User>(`/api/users/${id}`, data);
    return response.data;
  },

  /**
   * Elimina un usuario
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/api/users/${id}`);
  },

  /**
   * Obtiene el perfil del usuario actual
   * GET /api/users/me
   */
  async getProfile(): Promise<User> {
    const response = await apiClient.get<User>('/api/users/me');
    return response.data;
  },

  /**
   * Actualiza el perfil del usuario actual
   * PUT /api/users/me
   */
  async updateProfile(data: Partial<UpdateUserRequest>): Promise<User> {
    const response = await apiClient.put<User>('/api/users/me', data);
    return response.data;
  },
};
