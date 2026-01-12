import { apiClient } from '@/lib/api-client';
import { ApiOrder, CreateOrderPayload, OrderResponse } from '@/types';

export const orderService = {
  create: async (payload: CreateOrderPayload): Promise<ApiOrder> => {
    return apiClient.post<ApiOrder>('/orders', payload);
  },

  getAll: async (): Promise<ApiOrder[]> => {
    // If a userId is provided, construct the URL with it.  
    const url = '/orders';
    const response = await apiClient.get<OrderResponse | ApiOrder[]>(url);
    if ('data' in response && Array.isArray(response.data)) {
        return response.data;
    }
    return response as ApiOrder[];
  },

  getById: async (id: string | number): Promise<ApiOrder> => {
    return apiClient.get<ApiOrder>(`/orders/${id}`);
  }
};
