import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../api/client';
import type { ProductFilters, CreateProductData, UpdateProductData } from '../types';
import { STORES_QUERY_KEY } from './useStores';

export const PRODUCTS_QUERY_KEY = ['products'];

export function useProducts(storeId: number, filters?: ProductFilters) {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, storeId, filters],
    queryFn: () => productsApi.getByStore(storeId, filters),
    enabled: !!storeId,
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, 'detail', id],
    queryFn: () => productsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateProduct(storeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductData) => productsApi.create(storeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PRODUCTS_QUERY_KEY, storeId] });
      queryClient.invalidateQueries({ queryKey: [...STORES_QUERY_KEY, storeId, 'stats'] });
    },
  });
}

export function useUpdateProduct(storeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProductData }) =>
      productsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [...PRODUCTS_QUERY_KEY, storeId] });
      queryClient.invalidateQueries({ queryKey: [...PRODUCTS_QUERY_KEY, 'detail', id] });
      queryClient.invalidateQueries({ queryKey: [...STORES_QUERY_KEY, storeId, 'stats'] });
    },
  });
}

export function useUpdateProductStock(storeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) =>
      productsApi.updateStock(id, quantity),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [...PRODUCTS_QUERY_KEY, storeId] });
      queryClient.invalidateQueries({ queryKey: [...PRODUCTS_QUERY_KEY, 'detail', id] });
      queryClient.invalidateQueries({ queryKey: [...STORES_QUERY_KEY, storeId, 'stats'] });
    },
  });
}

export function useDeleteProduct(storeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PRODUCTS_QUERY_KEY, storeId] });
      queryClient.invalidateQueries({ queryKey: [...STORES_QUERY_KEY, storeId, 'stats'] });
    },
  });
}
