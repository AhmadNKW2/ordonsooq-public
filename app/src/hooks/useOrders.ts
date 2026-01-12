import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/services/order.service';
import type { CreateOrderPayload } from '@/types';

export const ORDER_QUERY_KEYS = {
  all: ['orders'] as const,
  lists: () => [...ORDER_QUERY_KEYS.all, 'list'] as const,
  details: () => [...ORDER_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string | number) => [...ORDER_QUERY_KEYS.details(), id] as const,
};

/**
 * Hook to fetch all orders for the current user
 */
export function useOrders() {
  return useQuery({
    queryKey: ORDER_QUERY_KEYS.lists(),
    queryFn: () => orderService.getAll(),
  });
}

/**
 * Hook to fetch a single order by ID
 */
export function useOrder(id: string | number) {
  return useQuery({
    queryKey: ORDER_QUERY_KEYS.detail(id),
    queryFn: () => orderService.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook to create a new order
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => orderService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.lists() });
    },
  });
}
