import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { documentsApi } from '@/api/documents.api';

/**
 * Query keys para React Query cache
 */
export const documentKeys = {
  all: ['documents'] as const,
  lists: () => [...documentKeys.all, 'list'] as const,
  byInvoice: (invoiceId: number) => [...documentKeys.all, 'invoice', invoiceId] as const,
  details: () => [...documentKeys.all, 'detail'] as const,
  detail: (id: number) => [...documentKeys.details(), id] as const,
};

/**
 * Hook para obtener documentos de una factura
 */
export const useDocumentsByInvoice = (invoiceId: number) => {
  return useQuery({
    queryKey: documentKeys.byInvoice(invoiceId),
    queryFn: () => documentsApi.listByInvoice(invoiceId),
    enabled: !!invoiceId && invoiceId > 0,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

/**
 * Hook para obtener un documento por ID
 */
export const useDocument = (id: number) => {
  return useQuery({
    queryKey: documentKeys.detail(id),
    queryFn: () => documentsApi.getById(id),
    enabled: !!id && id > 0,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

/**
 * Hook para subir un documento
 */
export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      invoiceId,
      uploadedBy,
    }: {
      file: File;
      invoiceId?: number;
      uploadedBy?: string;
    }) => documentsApi.upload(file, invoiceId, uploadedBy),

    onSuccess: (newDocument, variables) => {
      // Invalidar cache de documentos de la factura si existe
      if (variables.invoiceId) {
        queryClient.invalidateQueries({
          queryKey: documentKeys.byInvoice(variables.invoiceId),
        });
      }

      // Agregar al cache del documento
      queryClient.setQueryData(documentKeys.detail(newDocument.id), newDocument);

      toast.success(`Documento "${newDocument.originalFilename}" subido correctamente`);
    },

    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al subir documento';
      toast.error(message);
      console.error('Upload document error:', error);
    },
  });
};

/**
 * Hook para descargar un documento
 */
export const useDownloadDocument = () => {
  return useMutation({
    mutationFn: async ({ id, fileName }: { id: number; fileName?: string }) => {
      const blob = await documentsApi.download(id);
      return { blob, fileName: fileName || `document-${id}.pdf` };
    },

    onSuccess: ({ blob, fileName }) => {
      // Crear URL temporal para descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Documento "${fileName}" descargado`);
    },

    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al descargar documento';
      toast.error(message);
      console.error('Download document error:', error);
    },
  });
};

/**
 * Hook para eliminar un documento
 */
export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => documentsApi.delete(id),

    onSuccess: (_, deletedId) => {
      // Invalidar todas las listas de documentos
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });

      // Remover del cache individual
      queryClient.removeQueries({ queryKey: documentKeys.detail(deletedId) });

      toast.success('Documento eliminado correctamente');
    },

    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al eliminar documento';
      toast.error(message);
      console.error('Delete document error:', error);
    },
  });
};
