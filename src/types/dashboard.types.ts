export interface DashboardStats {
  totalInvoices: number;
  totalRevenue: number;
  pendingInvoices: number;
  paidInvoices: number;
  draftInvoices: number;
  cancelledInvoices: number;
}

export interface InvoiceStatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface RevenueByMonth {
  month: string;
  revenue: number;
  invoiceCount: number;
}

export interface DashboardData {
  stats: DashboardStats;
  statusDistribution: InvoiceStatusDistribution[];
  revenueByMonth: RevenueByMonth[];
  recentInvoices: RecentInvoice[];
}

export interface RecentInvoice {
  id: number;
  invoiceNumber: string;
  clientName: string;
  total: number;
  status: string;
  issueDate: string;
}
