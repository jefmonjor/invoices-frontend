import { apiClient } from './client';

export interface DashboardMetrics {
  totalRevenue: number;
  totalInvoices: number;
  averageInvoiceAmount: number;
  pendingAmount: number; // Monto pendiente de cobro (simulado o real si backend lo soporta)
  topClients: {
    id: number;
    name: string;
    totalSpent: number;
  }[];
  monthlyRevenue: {
    month: string;
    amount: number;
  }[];
}

export const dashboardApi = {
  getMetrics: async (companyId: number): Promise<DashboardMetrics> => {
    // Por ahora, usamos el endpoint de métricas existente y enriquecemos/adaptamos en frontend
    // O si el backend no tiene todo, simulamos algunas partes para la demo UX
    const response = await apiClient.get<any>(`/api/companies/${companyId}/metrics`);

    // Adaptar respuesta del backend al formato del Dashboard
    // Asumimos que el backend devuelve CompanyMetricsDto
    const data = response.data;

    return {
      totalRevenue: data.totalRevenue || 0,
      totalInvoices: data.totalInvoices || 0,
      averageInvoiceAmount: data.averageInvoiceAmount || 0,
      pendingAmount: data.totalRevenue * 0.15, // Simulado: 15% pendiente
      topClients: [ // Simulado por ahora si el backend no lo devuelve
        { id: 1, name: 'Cliente A', totalSpent: 12000 },
        { id: 2, name: 'Cliente B', totalSpent: 8500 },
        { id: 3, name: 'Cliente C', totalSpent: 5000 },
      ],
      monthlyRevenue: data.monthlyRevenue || [ // Fallback si no hay datos históricos
        { month: 'Ene', amount: 4000 },
        { month: 'Feb', amount: 3000 },
        { month: 'Mar', amount: 2000 },
        { month: 'Abr', amount: 2780 },
        { month: 'May', amount: 1890 },
        { month: 'Jun', amount: 2390 },
        { month: 'Jul', amount: 3490 },
      ]
    };
  }
};
