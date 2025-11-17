import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/api/users.api';
import type { CreateUserRequest, UpdateUserRequest, UserListParams } from '@/types/user.types';
import { toast } from 'react-toastify';

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params?: UserListParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
};

/**
 * Hook para obtener lista paginada de usuarios
 */
export const useUsers = (params?: UserListParams) => {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => usersApi.list(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook para obtener un usuario por ID
 */
export const useUser = (id: number) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersApi.getById(id),
    enabled: !!id && id > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook para obtener el perfil del usuario actual
 */
export const useProfile = () => {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: () => usersApi.getProfile(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook para crear un nuevo usuario
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => usersApi.create(data),
    onSuccess: (newUser) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.setQueryData(userKeys.detail(newUser.id), newUser);
      toast.success(`Usuario ${newUser.email} creado exitosamente`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Error al crear usuario';
      toast.error(message);
    },
  });
};

/**
 * Hook para actualizar un usuario existente
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserRequest }) =>
      usersApi.update(id, data),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.setQueryData(userKeys.detail(updatedUser.id), updatedUser);
      toast.success(`Usuario ${updatedUser.email} actualizado`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Error al actualizar usuario';
      toast.error(message);
    },
  });
};

/**
 * Hook para actualizar el perfil del usuario actual
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<UpdateUserRequest>) => usersApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(userKeys.profile(), updatedUser);
      toast.success('Perfil actualizado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Error al actualizar perfil';
      toast.error(message);
    },
  });
};

/**
 * Hook para eliminar un usuario
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.removeQueries({ queryKey: userKeys.detail(id) });
      toast.success('Usuario eliminado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Error al eliminar usuario';
      toast.error(message);
    },
  });
};
