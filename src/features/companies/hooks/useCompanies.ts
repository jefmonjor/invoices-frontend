import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { companiesApi } from '@/api/companies.api';
import type { CreateCompanyRequest } from '@/types/company.types';
import { toast } from 'react-toastify';

export const companyKeys = {
  all: ['companies'] as const,
  lists: () => [...companyKeys.all, 'list'] as const,
  list: () => [...companyKeys.lists()] as const,
  details: () => [...companyKeys.all, 'detail'] as const,
  detail: (id: number) => [...companyKeys.details(), id] as const,
};

/**
 * Hook para obtener lista de empresas
 */
export const useCompanies = () => {
  return useQuery({
    queryKey: companyKeys.list(),
    queryFn: () => companiesApi.list(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook para obtener una empresa por ID
 */
export const useCompany = (id: number) => {
  return useQuery({
    queryKey: companyKeys.detail(id),
    queryFn: () => companiesApi.getById(id),
    enabled: !!id && id > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook para crear una nueva empresa
 */
export const useCreateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCompanyRequest) => companiesApi.create(data),
    onSuccess: (newCompany) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
      queryClient.setQueryData(companyKeys.detail(newCompany.id), newCompany);
      toast.success(`Empresa ${newCompany.name} creada exitosamente`);
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : error instanceof Error
        ? error.message
        : 'Error al crear empresa';
      toast.error(message);
    },
  });
};

/**
 * Hook para actualizar una empresa existente
 */
export const useUpdateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateCompanyRequest> }) =>
      companiesApi.update(id, data),
    onSuccess: (updatedCompany) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
      queryClient.setQueryData(companyKeys.detail(updatedCompany.id), updatedCompany);
      toast.success(`Empresa ${updatedCompany.name} actualizada`);
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : error instanceof Error
        ? error.message
        : 'Error al actualizar empresa';
      toast.error(message);
    },
  });
};

/**
 * Hook para eliminar una empresa
 */
export const useDeleteCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => companiesApi.delete(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
      queryClient.removeQueries({ queryKey: companyKeys.detail(id) });
      toast.success('Empresa eliminada exitosamente');
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : error instanceof Error
        ? error.message
        : 'Error al eliminar empresa';
      toast.error(message);
    },
  });
};
