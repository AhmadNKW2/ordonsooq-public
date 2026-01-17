import { apiClient } from '@/lib/api-client';
import { Address } from '@/types';

export const addressService = {
  getAll: async (): Promise<Address[]> => {
    const response = await apiClient.get<{data: Address[]} | Address[]>(`/addresses`);
    if ('data' in response && Array.isArray(response.data)) {
        return response.data;
    }
    return response as Address[];
  },
  
  create: async (data: Partial<Address>): Promise<Address> => {
    const response = await apiClient.post<{data: Address} | Address>('/addresses', data);
    if ('data' in response) return response.data;
    return response as Address;
  },
  
  update: async (id: string, data: Partial<Address>): Promise<Address> => {
    const response = await apiClient.put<{data: Address} | Address>(`/addresses/${id}`, data);
    if ('data' in response) return response.data;
    return response as Address;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/addresses/${id}`);
  },
};
