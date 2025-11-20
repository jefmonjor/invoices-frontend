import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { invoicesApi } from '@/api/invoices.api';
import type { InvoiceListParams, CreateInvoiceRequest, UpdateInvoiceRequest, Invoice } from '@/types/invoice.types';
import type { Company } from '@/types/company.types';
import type { Client } from '@/types/client.types';
import { toast } from 'react-toastify';
import { generateInvoicePdfBlob } from '../utils/pdfGenerator';

// Keys for React Query cache
export const invoiceKeys = {
  all: ['invoices'] as const,
  lists: () => [...invoiceKeys.all, 'list'] as const,
  list: (params?: InvoiceListParams) => [...invoiceKeys.lists(), params] as const,
  details: () => [...invoiceKeys.all, 'detail'] as const,
  detail: (id: number) => [...invoiceKeys.details(), id] as const,
};

/**
 * Hook para obtener lista de facturas con paginación y filtros
 */
export const useInvoices = (params?: InvoiceListParams) => {
  return useQuery({
    queryKey: invoiceKeys.list(params),
    queryFn: () => invoicesApi.list(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook para obtener una factura por ID
 */
export const useInvoice = (id: number) => {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: () => invoicesApi.getById(id),
    enabled: !!id && id > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook para crear una nueva factura
 */
export const useCreateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInvoiceRequest) => invoicesApi.create(data),
    onSuccess: (newInvoice) => {
      // Invalidate all invoice lists to refetch
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });

      // Add the new invoice to cache
      queryClient.setQueryData(invoiceKeys.detail(newInvoice.id), newInvoice);

      toast.success(`Factura ${newInvoice.invoiceNumber} creada exitosamente`);
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : error instanceof Error
          ? error.message
          : 'Error al crear factura';
      toast.error(message);
    },
  });
};

/**
 * Hook para actualizar una factura existente
 */
export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateInvoiceRequest }) =>
      invoicesApi.update(id, data),
    onSuccess: (updatedInvoice) => {
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });

      // Update detail cache
      queryClient.setQueryData(invoiceKeys.detail(updatedInvoice.id), updatedInvoice);

      toast.success(`Factura ${updatedInvoice.invoiceNumber} actualizada`);
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : error instanceof Error
          ? error.message
          : 'Error al actualizar factura';
      toast.error(message);
    },
  });
};

/**
 * Hook para eliminar una factura
 */
export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => invoicesApi.delete(id),
    onSuccess: (_data, id) => {
      // Invalidate all queries
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });

      // Remove from cache
      queryClient.removeQueries({ queryKey: invoiceKeys.detail(id) });

      toast.success('Factura eliminada exitosamente');
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : error instanceof Error
          ? error.message
          : 'Error al eliminar factura';
      toast.error(message);
    },
  });
};

/**
 * Hook para generar y descargar PDF de una factura
 * Intenta descargar desde el backend (MinIO o JasperReports fallback)
 */
export const useGeneratePDF = () => {
  return useMutation({
    mutationFn: ({ id, invoiceNumber }: { id: number; invoiceNumber: string }) =>
      invoicesApi.downloadPDF(id, invoiceNumber),
    onSuccess: (_data, variables) => {
      toast.success(`PDF de factura ${variables.invoiceNumber} descargado`);
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : error instanceof Error
          ? error.message
          : 'Error al generar PDF';
      toast.error(message);
    },
  });
};

/**
 * Hook para subir un documento (PDF) al backend
 * El backend almacena el archivo en MinIO y guarda la referencia en la DB
 */
export const useUploadDocument = () => {
  return useMutation({
    mutationFn: ({
      file,
      invoiceId,
      uploadedBy = 'system',
      silent = false
    }: {
      file: File;
      invoiceId: number;
      uploadedBy?: string;
      silent?: boolean;
    }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('invoiceId', invoiceId.toString());
      formData.append('uploadedBy', uploadedBy);

      // Attach silent flag to response for conditional toast
      return axios.post('/api/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }).then(response => ({ ...response, silent }));
    },
    onSuccess: (response) => {
      // Only show toast if not silent mode (automatic PDF generation is silent)
      if (!response.silent) {
        toast.success('Documento subido exitosamente');
      }
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : error instanceof Error
          ? error.message
          : 'Error al subir documento';
      toast.error(message);
    },
  });
};

/**
 * Hook para regenerar PDF de una factura existente
 * Usado para facturas antiguas que no tienen PDF en MinIO
 * o cuando se necesita regenerar el PDF por cualquier razón
 */
export const useRegeneratePdf = () => {
  const uploadMutation = useUploadDocument();

  return useMutation({
    mutationFn: async ({
      invoice,
      company,
      client,
    }: {
      invoice: Invoice;
      company: Company;
      client: Client;
    }) => {
      // Generate PDF blob using React-PDF
      const blob = await generateInvoicePdfBlob(invoice, company, client);

      // Create file from blob
      const filename = `${invoice.invoiceNumber}.pdf`;
      const file = new File([blob], filename, { type: 'application/pdf' });

      // Upload to backend
      return uploadMutation.mutateAsync({
        file,
        invoiceId: invoice.id,
        uploadedBy: 'manual-regeneration',
        silent: false, // Show success toast for manual regeneration
      });
    },
    onSuccess: (_data, variables) => {
      toast.success(`PDF de factura ${variables.invoice.invoiceNumber} regenerado exitosamente`);
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : error instanceof Error
          ? error.message
          : 'Error al regenerar PDF';
      toast.error(message);
    },
  });
};
