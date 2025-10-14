import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions 
} from '@tanstack/react-query';
import { establishmentsService } from '../services/establishments';
import { handleApiError, getGlobalEstablishmentId } from '../services/api';
import {
  EstablishmentCreate,
  EstablishmentUpdate,
  EstablishmentResponse,
  ListQueryParams,
} from '../types/api';

// Query Keys for consistent caching
export const ESTABLISHMENTS_QUERY_KEYS = {
  all: ['establishments'] as const,
  lists: () => [...ESTABLISHMENTS_QUERY_KEYS.all, 'list'] as const,
  list: (params?: Partial<ListQueryParams>) => 
    [...ESTABLISHMENTS_QUERY_KEYS.lists(), params] as const,
  details: () => [...ESTABLISHMENTS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...ESTABLISHMENTS_QUERY_KEYS.details(), id] as const,
};

// Hook to list establishments with pagination
export const useEstablishments = (
  params?: ListQueryParams,
  options?: Omit<UseQueryOptions<EstablishmentResponse[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ESTABLISHMENTS_QUERY_KEYS.list(params),
    queryFn: () => establishmentsService.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

// Hook to get establishment by ID
export const useEstablishment = (
  establishmentId: number,
  options?: Omit<UseQueryOptions<EstablishmentResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ESTABLISHMENTS_QUERY_KEYS.detail(establishmentId),
    queryFn: () => establishmentsService.getById(establishmentId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!establishmentId,
    ...options,
  });
};

// Hook to get the current establishment from the token context
export const useCurrentEstablishment = (
  options?: Omit<UseQueryOptions<EstablishmentResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  const establishmentId = getGlobalEstablishmentId();
  
  return useEstablishment(establishmentId || 0, {
    enabled: !!establishmentId && options?.enabled !== false,
    ...options,
  });
};

// Hook to create a new establishment
export const useCreateEstablishment = (
  options?: Omit<UseMutationOptions<EstablishmentResponse, Error, EstablishmentCreate>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (establishmentData: EstablishmentCreate) => {
      return establishmentsService.create(establishmentData);
    },
    onSuccess: (newEstablishment, variables) => {
      // Invalidate and refetch establishments list
      queryClient.invalidateQueries({
        queryKey: ESTABLISHMENTS_QUERY_KEYS.lists(),
      });

      // Add the new establishment to the cache
      queryClient.setQueryData(
        ESTABLISHMENTS_QUERY_KEYS.detail(newEstablishment.id),
        newEstablishment
      );
      
      // Call the custom onSuccess if provided
      options?.onSuccess?.(newEstablishment, variables, undefined);
    },
    onError: (error) => {
      console.error('Error creating establishment:', handleApiError(error));
      options?.onError?.(error, {} as any, undefined);
    },
    ...options,
  });
};

// Hook to update an establishment
export const useUpdateEstablishment = (
  options?: UseMutationOptions<EstablishmentResponse, Error, { id: number; data: EstablishmentUpdate }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: EstablishmentUpdate }) =>
      establishmentsService.update(id, data),
    onSuccess: (updatedEstablishment, variables) => {
      // Update the establishment in the cache
      queryClient.setQueryData(
        ESTABLISHMENTS_QUERY_KEYS.detail(variables.id),
        updatedEstablishment
      );

      // Invalidate establishments lists to refresh them
      queryClient.invalidateQueries({
        queryKey: ESTABLISHMENTS_QUERY_KEYS.lists(),
      });

      // Call the custom onSuccess if provided
      options?.onSuccess?.(updatedEstablishment, variables, undefined);
    },
    onError: (error, variables) => {
      console.error(`Error updating establishment ${variables.id}:`, handleApiError(error));
      options?.onError?.(error, variables, undefined);
    },
    ...options,
  });
};

// Hook to update the current establishment (from token context)
export const useUpdateCurrentEstablishment = (
  options?: Omit<UseMutationOptions<EstablishmentResponse, Error, EstablishmentUpdate>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  const establishmentId = getGlobalEstablishmentId();
  
  return useMutation({
    mutationFn: (updateData: EstablishmentUpdate) => {
      if (!establishmentId) {
        throw new Error('No establishment selected');
      }
      return establishmentsService.update(establishmentId, updateData);
    },
    onSuccess: (updatedEstablishment, variables) => {
      // Update the establishment in the cache
      queryClient.setQueryData(
        ESTABLISHMENTS_QUERY_KEYS.detail(establishmentId),
        updatedEstablishment
      );

      // Invalidate establishments lists to refresh them
      queryClient.invalidateQueries({
        queryKey: ESTABLISHMENTS_QUERY_KEYS.lists(),
      });
      
      // Call the custom onSuccess if provided
      options?.onSuccess?.(updatedEstablishment, variables, undefined);
    },
    onError: (error) => {
      console.error('Error updating current establishment:', handleApiError(error));
      options?.onError?.(error, {} as any, undefined);
    },
    ...options,
  });
};

// Hook to partially update an establishment
export const usePatchEstablishment = (
  options?: UseMutationOptions<EstablishmentResponse, Error, { id: number; data: Partial<EstablishmentUpdate> }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<EstablishmentUpdate> }) =>
      establishmentsService.patch(id, data),
    onSuccess: (updatedEstablishment, variables) => {
      // Update the establishment in the cache
      queryClient.setQueryData(
        ESTABLISHMENTS_QUERY_KEYS.detail(variables.id),
        updatedEstablishment
      );

      // Invalidate establishments lists to refresh them
      queryClient.invalidateQueries({
        queryKey: ESTABLISHMENTS_QUERY_KEYS.lists(),
      });

      // Call the custom onSuccess if provided
      options?.onSuccess?.(updatedEstablishment, variables, undefined);
    },
    onError: (error, variables) => {
      console.error(`Error patching establishment ${variables.id}:`, handleApiError(error));
      options?.onError?.(error, variables, undefined);
    },
    ...options,
  });
};

// Hook to delete an establishment (superuser only)
export const useDeleteEstablishment = (
  options?: Omit<UseMutationOptions<void, Error, number>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (establishmentId: number) => {
      return establishmentsService.delete(establishmentId);
    },
    onSuccess: (_, establishmentId, context) => {
      // Invalidate and refetch establishments list
      queryClient.invalidateQueries({
        queryKey: ESTABLISHMENTS_QUERY_KEYS.lists(),
      });

      // Remove the establishment from individual query cache
      queryClient.removeQueries({
        queryKey: ESTABLISHMENTS_QUERY_KEYS.detail(establishmentId),
      });
      
      // Call the custom onSuccess if provided
      options?.onSuccess?.(undefined, establishmentId, context);
    },
    onError: (error, establishmentId) => {
      console.error(`Error deleting establishment ${establishmentId}:`, handleApiError(error));
      options?.onError?.(error, establishmentId, undefined);
    },
    ...options,
  });
};