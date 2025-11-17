import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsApi } from '@/api/clients.api';
import type { CreateClientRequest } from '@/types/client.types';
import { toast } from 'react-toastify';

export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: () => [...clientKeys.lists()] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: number) => [...clientKeys.details(), id] as const,
};

/**
 * Hook para obtener lista de clientes
 */
export const useClients = () => {
  return useQuery({
    queryKey: clientKeys.list(),
    queryFn: () => clientsApi.list(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook para obtener un cliente por ID
 */
export const useClient = (id: number) => {
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: () => clientsApi.getById(id),
    enabled: !!id && id > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook para crear un nuevo cliente
 */
export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClientRequest) => clientsApi.create(data),
    onSuccess: (newClient) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      queryClient.setQueryData(clientKeys.detail(newClient.id), newClient);
      toast.success(`Cliente ${newClient.name} creado exitosamente`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Error al crear cliente';
      toast.error(message);
    },
  });
};

/**
 * Hook para actualizar un cliente existente
 */
export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateClientRequest> }) =>
      clientsApi.update(id, data),
    onSuccess: (updatedClient) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      queryClient.setQueryData(clientKeys.detail(updatedClient.id), updatedClient);
      toast.success(`Cliente ${updatedClient.name} actualizado`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Error al actualizar cliente';
      toast.error(message);
    },
  });
};

/**
 * Hook para eliminar un cliente
 */
export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => clientsApi.delete(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      queryClient.removeQueries({ queryKey: clientKeys.detail(id) });
      toast.success('Cliente eliminado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Error al eliminar cliente';
      toast.error(message);
    },
  });
};
