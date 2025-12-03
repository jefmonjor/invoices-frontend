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

  // Forgot Password - Send reset email
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/api/auth/forgot-password', { email });
    return response.data;
  },

  // Verify Reset Token
  verifyResetToken: async (token: string): Promise<{ valid: boolean }> => {
    const response = await apiClient.get<{ valid: boolean }>(`/api/auth/verify-reset-token/${token}`);
    return response.data;
  },

  // Reset Password
  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/api/auth/reset-password', {
      token,
      newPassword
    });
    return response.data;
  },

  // NOTE: switchCompany moved to companiesApi
  // Use: companiesApi.switchCompany(companyId)
  // Endpoint: POST /api/companies/switch/{companyId}
};
