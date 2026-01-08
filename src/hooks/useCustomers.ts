import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions 
} from '@tanstack/react-query';
import { customersService } from '../services/customers';
import { handleApiError, getGlobalEstablishmentId } from '../services/api';
import {
  CustomerCreate,
  CustomerUpdate,
  CustomerResponse,
  EstablishmentListQueryParams,
} from '../types/api';

// Query Keys for consistent caching
export const CUSTOMERS_QUERY_KEYS = {
  all: ['customers'] as const,
  lists: () => [...CUSTOMERS_QUERY_KEYS.all, 'list'] as const,
  list: (establishmentId: number, params?: Partial<EstablishmentListQueryParams>) => 
    [...CUSTOMERS_QUERY_KEYS.lists(), establishmentId, params] as const,
  details: () => [...CUSTOMERS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...CUSTOMERS_QUERY_KEYS.details(), id] as const,
  search: (establishmentId: number, term: string) => 
    [...CUSTOMERS_QUERY_KEYS.all, 'search', establishmentId, term] as const,
};

// Hook to list customers for an establishment
export const useCustomers = (
  params: EstablishmentListQueryParams,
  options?: Omit<UseQueryOptions<CustomerResponse[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: CUSTOMERS_QUERY_KEYS.list(params.establishment_id, params),
    queryFn: () => customersService.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

// Hook to get all customers for an establishment
export const useAllCustomers = (
  establishmentId: number,
  options?: Omit<UseQueryOptions<CustomerResponse[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: CUSTOMERS_QUERY_KEYS.list(establishmentId, { establishment_id: establishmentId }),
    queryFn: () => customersService.getAllForEstablishment(establishmentId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

// Hook to get a single customer by ID
export const useCustomer = (
  customerId: number,
  options?: Omit<UseQueryOptions<CustomerResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: CUSTOMERS_QUERY_KEYS.detail(customerId),
    queryFn: () => customersService.getById(customerId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!customerId,
    ...options,
  });
};

// Hook to search customers
export const useCustomerSearch = (
  establishmentId: number,
  searchTerm: string,
  options?: Omit<UseQueryOptions<CustomerResponse[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: CUSTOMERS_QUERY_KEYS.search(establishmentId, searchTerm),
    queryFn: () => customersService.search(establishmentId, searchTerm),
    enabled: !!searchTerm && searchTerm.length >= 2, // Only search with 2+ characters
    staleTime: 2 * 60 * 1000, // 2 minutes (shorter for search results)
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Hook to create a customer
export const useCreateCustomer = (
  options?: Omit<UseMutationOptions<CustomerResponse, Error, CustomerCreate>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (customerData: CustomerCreate) => customersService.create(customerData),
    onSuccess: (newCustomer, variables) => {
      // Invalidate all customer-related queries for this establishment
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            Array.isArray(queryKey) &&
            queryKey[0] === 'customers' &&
            queryKey.includes(variables.establishment_id)
          );
        },
      });

      // Add the new customer to the cache
      queryClient.setQueryData(
        CUSTOMERS_QUERY_KEYS.detail(newCustomer.id),
        newCustomer
      );
    },
    onError: (error) => {
      console.error('Error creating customer:', handleApiError(error));
    },
    ...options,
  });
};

// Hook to update a customer
export const useUpdateCustomer = (
  customerId: number,
  options?: Omit<UseMutationOptions<CustomerResponse, Error, CustomerUpdate>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updateData: CustomerUpdate) => customersService.update(customerId, updateData),
    onSuccess: (updatedCustomer) => {
      // Update the specific customer in cache
      queryClient.setQueryData(
        CUSTOMERS_QUERY_KEYS.detail(customerId),
        updatedCustomer
      );

      // Invalidate list queries to refetch
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            Array.isArray(queryKey) &&
            queryKey[0] === 'customers' &&
            queryKey[1] === 'list'
          );
        },
      });
    },
    onError: (error) => {
      console.error('Error updating customer:', handleApiError(error));
    },
    ...options,
  });
};

// Hooks for current establishment context

// Hook to list customers for the current establishment
export const useCurrentEstablishmentCustomers = (
  params?: Partial<Omit<EstablishmentListQueryParams, 'establishment_id'>>,
  options?: Omit<UseQueryOptions<CustomerResponse[], Error>, 'queryKey' | 'queryFn'>
) => {
  const establishmentId = getGlobalEstablishmentId();
  
  return useCustomers(
    {
      establishment_id: establishmentId || 0,
      ...params,
    },
    {
      enabled: !!establishmentId && options?.enabled !== false,
      ...options,
    }
  );
};

// Hook to get all customers for the current establishment
export const useAllCurrentEstablishmentCustomers = (
  options?: Omit<UseQueryOptions<CustomerResponse[], Error>, 'queryKey' | 'queryFn'>
) => {
  const establishmentId = getGlobalEstablishmentId();
  
  return useAllCustomers(establishmentId || 0, {
    enabled: !!establishmentId && options?.enabled !== false,
    ...options,
  });
};

// Hook to search customers in the current establishment
export const useCurrentEstablishmentCustomerSearch = (
  searchTerm: string,
  options?: Omit<UseQueryOptions<CustomerResponse[], Error>, 'queryKey' | 'queryFn'>
) => {
  const establishmentId = getGlobalEstablishmentId();
  
  return useCustomerSearch(establishmentId || 0, searchTerm, {
    enabled: !!establishmentId && !!searchTerm && searchTerm.length >= 2 && options?.enabled !== false,
    ...options,
  });
};

// Hook to create customer in the current establishment
export const useCreateCurrentEstablishmentCustomer = (
  options?: Omit<UseMutationOptions<CustomerResponse, Error, Omit<CustomerCreate, 'establishment_id'>>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  const establishmentId = getGlobalEstablishmentId();
  
  return useMutation({
    mutationFn: (customerData: Omit<CustomerCreate, 'establishment_id'>) => {
      if (!establishmentId) {
        throw new Error('No establishment selected');
      }
      return customersService.create({
        ...customerData,
        establishment_id: establishmentId,
      });
    },
    onSuccess: (newCustomer, variables) => {
      // Invalidate all customer-related queries for this establishment
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            Array.isArray(queryKey) &&
            queryKey[0] === 'customers' &&
            queryKey.includes(establishmentId)
          );
        },
      });

      // Force refetch by removing and invalidating the specific query
      queryClient.removeQueries({
        queryKey: CUSTOMERS_QUERY_KEYS.list(establishmentId, { establishment_id: establishmentId }),
      });

      // Add the new customer to the cache
      queryClient.setQueryData(
        CUSTOMERS_QUERY_KEYS.detail(newCustomer.id),
        newCustomer
      );

      // Call the user's onSuccess if provided
      options?.onSuccess?.(newCustomer, variables, undefined as any);
    },
    onError: (error, variables, context) => {
      console.error('Error creating customer:', handleApiError(error));
      options?.onError?.(error, variables, context);
    },
  });
};

// Utility hook to invalidate customers cache
export const useInvalidateCustomers = () => {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({
        queryKey: CUSTOMERS_QUERY_KEYS.all,
      });
    },
    invalidateList: (establishmentId: number) => {
      queryClient.invalidateQueries({
        queryKey: CUSTOMERS_QUERY_KEYS.lists(),
        predicate: (query) => {
          const queryKey = query.queryKey;
          return Array.isArray(queryKey) && queryKey.includes(establishmentId);
        },
      });
    },
    invalidateDetail: (customerId: number) => {
      queryClient.invalidateQueries({
        queryKey: CUSTOMERS_QUERY_KEYS.detail(customerId),
      });
    },
  };
};
