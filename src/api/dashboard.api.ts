import { apiClient } from './client';
import type { DashboardData } from '@/types/dashboard.types';

export const dashboardApi = {
  /**
   * Obtiene los datos del dashboard
   */
  async getDashboardData(): Promise<DashboardData> {
    const response = await apiClient.get<DashboardData>('/invoices/dashboard');
    return response.data;
  },
};
