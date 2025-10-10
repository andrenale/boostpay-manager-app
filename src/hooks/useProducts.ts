import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions 
} from '@tanstack/react-query';
import { productsService } from '../services/products';
import { handleApiError, getGlobalEstablishmentId } from '../services/api';
import {
  ProductCreate,
  ProductUpdate,
  ProductResponse,
  EstablishmentListQueryParams,
} from '../types/api';

// Query Keys for consistent caching
export const PRODUCTS_QUERY_KEYS = {
  all: ['products'] as const,
  lists: () => [...PRODUCTS_QUERY_KEYS.all, 'list'] as const,
  list: (establishmentId: number, params?: Partial<EstablishmentListQueryParams>) => 
    [...PRODUCTS_QUERY_KEYS.lists(), establishmentId, params] as const,
  details: () => [...PRODUCTS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...PRODUCTS_QUERY_KEYS.details(), id] as const,
  search: (establishmentId: number, term: string) => 
    [...PRODUCTS_QUERY_KEYS.all, 'search', establishmentId, term] as const,
  priceRange: (establishmentId: number, minPrice: number, maxPrice: number) =>
    [...PRODUCTS_QUERY_KEYS.all, 'priceRange', establishmentId, minPrice, maxPrice] as const,
};

// Hook to list products for an establishment
export const useProducts = (
  params: EstablishmentListQueryParams,
  options?: Omit<UseQueryOptions<ProductResponse[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: PRODUCTS_QUERY_KEYS.list(params.establishment_id, params),
    queryFn: () => productsService.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

// Hook to get all products for an establishment (with automatic pagination)
export const useAllProducts = (
  establishmentId: number,
  options?: Omit<UseQueryOptions<ProductResponse[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: PRODUCTS_QUERY_KEYS.list(establishmentId, { establishment_id: establishmentId }),
    queryFn: () => productsService.getAllForEstablishment(establishmentId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

// Hook to get a single product by ID
export const useProduct = (
  productId: number,
  options?: Omit<UseQueryOptions<ProductResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: PRODUCTS_QUERY_KEYS.detail(productId),
    queryFn: () => productsService.getById(productId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!productId,
    ...options,
  });
};

// Hook to search products
export const useProductSearch = (
  establishmentId: number,
  searchTerm: string,
  options?: Omit<UseQueryOptions<ProductResponse[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: PRODUCTS_QUERY_KEYS.search(establishmentId, searchTerm),
    queryFn: () => productsService.search(establishmentId, searchTerm),
    enabled: !!searchTerm && searchTerm.length >= 2, // Only search with 2+ characters
    staleTime: 2 * 60 * 1000, // 2 minutes (shorter for search results)
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Hook to get products by price range
export const useProductsByPriceRange = (
  establishmentId: number,
  minPrice: number,
  maxPrice: number,
  options?: Omit<UseQueryOptions<ProductResponse[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: PRODUCTS_QUERY_KEYS.priceRange(establishmentId, minPrice, maxPrice),
    queryFn: () => productsService.getByPriceRange(establishmentId, minPrice, maxPrice),
    enabled: minPrice >= 0 && maxPrice > minPrice,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

// Mutation hook to create a product
export const useCreateProduct = (
  options?: UseMutationOptions<ProductResponse, Error, ProductCreate>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productData: ProductCreate) => productsService.create(productData),
    onSuccess: (newProduct, variables) => {
      // Invalidate and refetch products list for the establishment
      queryClient.invalidateQueries({
        queryKey: PRODUCTS_QUERY_KEYS.lists(),
        predicate: (query) => {
          const key = query.queryKey as any[];
          return key.includes(variables.establishment_id);
        },
      });

      // Add the new product to the cache
      queryClient.setQueryData(
        PRODUCTS_QUERY_KEYS.detail(newProduct.id),
        newProduct
      );
    },
    onError: (error) => {
      console.error('Error creating product:', handleApiError(error));
    },
    ...options,
  });
};

// Mutation hook to update a product
export const useUpdateProduct = (
  options?: UseMutationOptions<ProductResponse, Error, { id: number; data: ProductUpdate }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductUpdate }) =>
      productsService.update(id, data),
    onSuccess: (updatedProduct, variables) => {
      // Update the product in the cache
      queryClient.setQueryData(
        PRODUCTS_QUERY_KEYS.detail(variables.id),
        updatedProduct
      );

      // Invalidate products lists to refresh them
      queryClient.invalidateQueries({
        queryKey: PRODUCTS_QUERY_KEYS.list(updatedProduct.establishment_id, { establishment_id: updatedProduct.establishment_id }),
      });

      // Invalidate search results that might be affected
      queryClient.invalidateQueries({
        queryKey: [...PRODUCTS_QUERY_KEYS.all, 'search', updatedProduct.establishment_id],
        exact: false,
      });
    },
    onError: (error) => {
      console.error('Error updating product:', handleApiError(error));
    },
    ...options,
  });
};

// Mutation hook to partially update a product
export const usePatchProduct = (
  options?: UseMutationOptions<ProductResponse, Error, { id: number; data: Partial<ProductUpdate> }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ProductUpdate> }) =>
      productsService.patch(id, data),
    onSuccess: (updatedProduct, variables) => {
      // Update the product in the cache
      queryClient.setQueryData(
        PRODUCTS_QUERY_KEYS.detail(variables.id),
        updatedProduct
      );

      // Invalidate products lists to refresh them
      queryClient.invalidateQueries({
        queryKey: PRODUCTS_QUERY_KEYS.lists(),
        predicate: (query) => {
          const key = query.queryKey as any[];
          return key.includes(updatedProduct.establishment_id);
        },
      });

      // Invalidate search results that might be affected
      queryClient.invalidateQueries({
        queryKey: [...PRODUCTS_QUERY_KEYS.all, 'search'],
      });
    },
    onError: (error) => {
      console.error('Error patching product:', handleApiError(error));
    },
    ...options,
  });
};

// Hook to check if a product code exists
export const useProductCodeExists = (
  establishmentId: number,
  code: string,
  excludeProductId?: number,
  options?: Omit<UseQueryOptions<boolean, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEYS.all, 'codeExists', establishmentId, code, excludeProductId],
    queryFn: () => productsService.codeExists(establishmentId, code, excludeProductId),
    enabled: !!code && code.length > 0,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

// Utility hook to prefetch a product
export const usePrefetchProduct = () => {
  const queryClient = useQueryClient();

  return (productId: number) => {
    queryClient.prefetchQuery({
      queryKey: PRODUCTS_QUERY_KEYS.detail(productId),
      queryFn: () => productsService.getById(productId),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };
};

// Utility hook to invalidate products cache
export const useInvalidateProducts = () => {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({
        queryKey: PRODUCTS_QUERY_KEYS.all,
      });
    },
    invalidateList: (establishmentId: number) => {
      queryClient.invalidateQueries({
        queryKey: PRODUCTS_QUERY_KEYS.lists(),
        predicate: (query) => {
          const key = query.queryKey as any[];
          return key.includes(establishmentId);
        },
      });
    },
    invalidateDetail: (productId: number) => {
      queryClient.invalidateQueries({
        queryKey: PRODUCTS_QUERY_KEYS.detail(productId),
      });
    },
  };
};

// Convenience hooks that use the global establishment ID

// Hook to get products for the current establishment
export const useCurrentEstablishmentProducts = (
  params?: Partial<Omit<EstablishmentListQueryParams, 'establishment_id'>>,
  options?: Omit<UseQueryOptions<ProductResponse[], Error>, 'queryKey' | 'queryFn'>
) => {
  const establishmentId = getGlobalEstablishmentId();
  
  return useProducts(
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

// Hook to get all products for the current establishment
export const useAllCurrentEstablishmentProducts = (
  options?: Omit<UseQueryOptions<ProductResponse[], Error>, 'queryKey' | 'queryFn'>
) => {
  const establishmentId = getGlobalEstablishmentId();
  
  return useAllProducts(establishmentId || 0, {
    enabled: !!establishmentId && options?.enabled !== false,
    ...options,
  });
};

// Hook to search products in the current establishment
export const useCurrentEstablishmentProductSearch = (
  searchTerm: string,
  options?: Omit<UseQueryOptions<ProductResponse[], Error>, 'queryKey' | 'queryFn'>
) => {
  const establishmentId = getGlobalEstablishmentId();
  
  return useProductSearch(establishmentId || 0, searchTerm, {
    enabled: !!establishmentId && !!searchTerm && searchTerm.length >= 2 && options?.enabled !== false,
    ...options,
  });
};

// Hook to create product in the current establishment
export const useCreateCurrentEstablishmentProduct = (
  options?: Omit<UseMutationOptions<ProductResponse, Error, Omit<ProductCreate, 'establishment_id'>>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  const establishmentId = getGlobalEstablishmentId();
  
  return useMutation({
    mutationFn: (productData: Omit<ProductCreate, 'establishment_id'>) => {
      if (!establishmentId) {
        throw new Error('No establishment selected');
      }
      return productsService.create({
        ...productData,
        establishment_id: establishmentId,
      });
    },
    onSuccess: (newProduct, variables) => {
      // Invalidate all product-related queries for this establishment
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          // Match any query that starts with ['products'] and includes the establishmentId
          return (
            Array.isArray(queryKey) &&
            queryKey[0] === 'products' &&
            queryKey.includes(establishmentId)
          );
        },
      });

      // Force refetch by removing and invalidating the specific query
      queryClient.removeQueries({
        queryKey: PRODUCTS_QUERY_KEYS.list(establishmentId, { establishment_id: establishmentId }),
      });

      // Add the new product to the cache
      queryClient.setQueryData(
        PRODUCTS_QUERY_KEYS.detail(newProduct.id),
        newProduct
      );
      
      // Call the custom onSuccess if provided
      options?.onSuccess?.(newProduct, variables, undefined);
    },
    onError: (error) => {
      console.error('Error creating product:', handleApiError(error));
      options?.onError?.(error, {} as any, undefined);
    },
    ...options,
  });
};

// Hook to delete a product from the current establishment
export const useDeleteCurrentEstablishmentProduct = (
  options?: Omit<UseMutationOptions<void, Error, number>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  const establishmentId = getGlobalEstablishmentId();
  
  return useMutation({
    mutationFn: (productId: number) => {
      if (!establishmentId) {
        throw new Error('No establishment selected');
      }
      return productsService.delete(productId);
    },
    onSuccess: (_, productId, context) => {
      // Invalidate and refetch products list for the establishment
      queryClient.invalidateQueries({
        queryKey: PRODUCTS_QUERY_KEYS.list(establishmentId, { establishment_id: establishmentId }),
      });

      // Also invalidate search results
      queryClient.invalidateQueries({
        queryKey: [...PRODUCTS_QUERY_KEYS.all, 'search', establishmentId],
        exact: false,
      });

      // Remove the product from individual query cache
      queryClient.removeQueries({
        queryKey: PRODUCTS_QUERY_KEYS.detail(productId),
      });
      
      // Call the custom onSuccess if provided
      options?.onSuccess?.(undefined, productId, context);
    },
    onError: (error, productId) => {
      console.error(`Error deleting product ${productId}:`, handleApiError(error));
      options?.onError?.(error, productId, undefined);
    },
    ...options,
  });
};