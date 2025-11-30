import { apiClient } from './client';

export interface BaseDashboardDTO {
  role: 'PLATFORM_ADMIN' | 'COMPANY_ADMIN' | 'COMPANY_USER';
}

export interface PlatformAdminDashboardDTO extends BaseDashboardDTO {
  role: 'PLATFORM_ADMIN';
  activeCompaniesCount: number;
  dailyInvoicesCount: number;
  verifactuAdoptionRate: number;
  inactiveCompaniesAlerts: string[];
  monthlyGrowthData: Record<string, number>;
}

export interface ClientRevenueDTO {
  clientName: string;
  totalRevenue: number;
}

export interface CompanyAdminDashboardDTO extends BaseDashboardDTO {
  role: 'COMPANY_ADMIN';
  pendingInvoicesTotal: number;
  verifactuRejectedCount: number;
  top5Clients: ClientRevenueDTO[];
  last30DaysRevenue: Record<string, number>;
}

export interface InvoiceSummaryDTO {
  id: number;
  number: string;
  amount: number;
  status: string;
  date: string;
}

export interface CompanyUserDashboardDTO extends BaseDashboardDTO {
  role: 'COMPANY_USER';
  myInvoicesThisMonth: number;
  myLastInvoices: InvoiceSummaryDTO[];
}

export type DashboardDTO =
  | PlatformAdminDashboardDTO
  | CompanyAdminDashboardDTO
  | CompanyUserDashboardDTO;

export const dashboardApi = {
  getDashboardData: async (): Promise<DashboardDTO> => {
    const response = await apiClient.get<DashboardDTO>('/api/dashboard');
    return response.data;
  }
};
