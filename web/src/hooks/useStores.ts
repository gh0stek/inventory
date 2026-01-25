import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storesApi } from '../api/client';

export const STORES_QUERY_KEY = ['stores'];

type UpdateStoreData = { name?: string; address?: string; phone?: string };

export function useStores() {
  return useQuery({
    queryKey: STORES_QUERY_KEY,
    queryFn: storesApi.getAll,
  });
}

export function useStore(id: number) {
  return useQuery({
    queryKey: [...STORES_QUERY_KEY, id],
    queryFn: () => storesApi.getById(id),
    enabled: !!id,
  });
}

export function useStoreStats(id: number) {
  return useQuery({
    queryKey: [...STORES_QUERY_KEY, id, 'stats'],
    queryFn: () => storesApi.getStats(id),
    enabled: !!id,
  });
}

export function useCreateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: storesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STORES_QUERY_KEY });
    },
  });
}

export function useUpdateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateStoreData }) =>
      storesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: STORES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...STORES_QUERY_KEY, id] });
    },
  });
}

export function useDeleteStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: storesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STORES_QUERY_KEY });
    },
  });
}
