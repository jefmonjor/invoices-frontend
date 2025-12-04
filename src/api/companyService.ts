import { apiClient } from './client';

export interface CompanyUser {
    userId: number;
    name: string;
    email: string;
    role: 'ADMIN' | 'USER';
    joinedAt?: string;
}

export const companyService = {
    /**
     * Get all users in a company (ADMIN only)
     */
    getUsers: async (companyId: number) => {
        const response = await apiClient.get(`/api/companies/${companyId}/users`);
        return response.data;
    },

    /**
     * Remove a user from company (ADMIN only)
     */
    removeUser: async (companyId: number, userId: number) => {
        await apiClient.delete(`/api/companies/${companyId}/users/${userId}`);
    },

    /**
     * Update user role in company (ADMIN only)
     * PATCH /api/companies/{companyId}/users/{userId}/role
     */
    updateUserRole: async (companyId: number, userId: number, role: 'ADMIN' | 'USER') => {
        await apiClient.patch(`/api/companies/${companyId}/users/${userId}/role`, { role });
    },

    /**
     * Delete company (ADMIN only)
     */
    deleteCompany: async (companyId: number) => {
        await apiClient.delete(`/api/companies/${companyId}`);
    },
};

export default companyService;

