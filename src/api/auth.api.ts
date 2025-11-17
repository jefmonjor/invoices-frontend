import { apiClient } from './client';
import type { LoginRequest, LoginResponse, RegisterRequest } from '@/types/auth.types';

export const authApi = {
  // Login
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/api/auth/login', data);
    return response.data;
  },

  // Register
  register: async (data: RegisterRequest): Promise<void> => {
    await apiClient.post('/api/auth/register', data);
  },

  // Logout (local)
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
