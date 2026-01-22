import { apiClient } from '@/lib/api-client';
import { Cart, CartItem } from '@/types';

export const cartService = {
  getCart: async (): Promise<Cart> => {
    return apiClient.get<Cart>('/cart');
  },

  addItem: async (data: { product_id: number; quantity: number; variant_id?: number }): Promise<any> => {
    return apiClient.post('/cart', data);
  },

  updateItem: async (itemId: number, quantity: number): Promise<any> => {
    return apiClient.patch(`/cart/${itemId}`, { quantity });
  },

  removeItem: async (itemId: number): Promise<any> => {
    return apiClient.delete(`/cart/${itemId}`);
  },

  clear: async (): Promise<any> => {
    return apiClient.delete('/cart');
  }
};
