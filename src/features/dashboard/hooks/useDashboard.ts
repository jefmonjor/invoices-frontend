import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/api/dashboard.api';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  data: () => [...dashboardKeys.all, 'data'] as const,
};

/**
 * Hook para obtener los datos del dashboard
 */
export const useDashboard = () => {
  return useQuery({
    queryKey: dashboardKeys.data(),
    queryFn: () => dashboardApi.getDashboardData(),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
};
