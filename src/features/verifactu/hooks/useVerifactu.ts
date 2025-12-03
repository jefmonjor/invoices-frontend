import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { verifactuApi } from '@/api/verifactu.api';
import { toast } from 'react-toastify';

/**
 * Query keys para Verifactu
 */
export const verifactuKeys = {
  all: ['verifactu'] as const,
  metrics: () => [...verifactuKeys.all, 'metrics'] as const,
  batchSummary: () => [...verifactuKeys.all, 'batch-summary'] as const,
};

/**
 * Hook para obtener métricas de Verifactu
 */
export function useVerifactuMetrics() {
  return useQuery({
    queryKey: verifactuKeys.metrics(),
    queryFn: verifactuApi.getMetrics,
    staleTime: 1000 * 60, // 1 minuto
  });
}

/**
 * Hook para enviar factura para verificación
 */
export function useSubmitInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: verifactuApi.submitInvoice,
    onSuccess: (data) => {
      toast.success(data.message || 'Factura enviada para verificación');

      // Invalidar métricas y la factura específica
      queryClient.invalidateQueries({ queryKey: verifactuKeys.metrics() });
      queryClient.invalidateQueries({ queryKey: ['invoices', data.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
        'Error al enviar factura para verificación'
      );
    },
  });
}

/**
 * Hook para obtener resumen del último batch
 */
export function useVerifactuBatchSummary() {
  return useQuery({
    queryKey: verifactuKeys.batchSummary(),
    queryFn: verifactuApi.getBatchSummary,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
