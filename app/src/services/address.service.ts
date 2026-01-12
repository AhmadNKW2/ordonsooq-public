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
  
  // Placeholder for future implementation matching RESTful patterns if needed
  // create: (data: any) => apiClient.post('/addresses', data),
  // update: (id: string, data: any) => apiClient.put(`/addresses/${id}`, data),
  // delete: (id: string) => apiClient.delete(`/addresses/${id}`),
};
