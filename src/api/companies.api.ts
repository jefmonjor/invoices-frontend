import { apiClient } from './client';
import type { Company, CreateCompanyRequest, CompanyUser } from '@/types/company.types';

export interface InvitationResponse {
  code: string;
  expiresInHours: number;
}

export interface CompanyUsersResponse {
  users: CompanyUser[];
  totalCount: number;
}

export const companiesApi = {
  /**
   * Get current user's companies with their roles
   */
  getUserCompanies: async (): Promise<Company[]> => {
    const response = await apiClient.get<Company[]>('/api/users/me/companies');
    return response.data;
  },

  /**
   * Set a company as the user's default/active company
   */
  setDefaultCompany: async (companyId: number): Promise<void> => {
    await apiClient.put(`/api/users/me/companies/${companyId}/set-default`);
  },

  /**
   * Get company by ID
   */
  getById: async (id: number): Promise<Company> => {
    const response = await apiClient.get<Company>(`/api/companies/${id}`);
    return response.data;
  },

  /**
   * Create a new company (ADMIN only)
   */
  create: async (data: CreateCompanyRequest): Promise<Company> => {
    const response = await apiClient.post<Company>('/api/companies', data);
    return response.data;
  },

  /**
   * Update company details (ADMIN only)
   */
  update: async (id: number, data: Partial<CreateCompanyRequest>): Promise<Company> => {
    const response = await apiClient.put<Company>(`/api/companies/${id}`, data);
    return response.data;
  },

  /**
   * Get all users in a company (ADMIN only)
   */
  getCompanyUsers: async (companyId: number): Promise<CompanyUsersResponse> => {
    const response = await apiClient.get<CompanyUsersResponse>(`/api/companies/${companyId}/users`);
    return response.data;
  },

  /**
   * Generate invitation code for a company (ADMIN only)
   */
  generateInvitation: async (companyId: number, expiresInHours: number = 168): Promise<InvitationResponse> => {
    const response = await apiClient.post<InvitationResponse>(
      `/api/companies/${companyId}/invitations`,
      { expiresInHours }
    );
    return response.data;
  },

  /**
   * Validate invitation code (public)
   */
  validateInvitation: async (code: string): Promise<Company> => {
    const response = await apiClient.get<Company>(`/api/companies/validate/${code}`);
    return response.data;
  },

  /**
   * List all companies (ADMIN only)
   */
  list: async (): Promise<Company[]> => {
    const response = await apiClient.get<Company[]>('/api/companies');
    return response.data;
  },

  /**
   * Delete a company (ADMIN only)
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/companies/${id}`);
  },
};
