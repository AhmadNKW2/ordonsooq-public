import { apiClient } from '@/lib/api-client';
import { WishlistResponse, WishlistItem } from '@/types';

export const wishlistService = {
  getWishlist: async (): Promise<WishlistResponse> => {
    return apiClient.get<WishlistResponse>('/wishlist');
  },

  addItem: async (productId: number): Promise<any> => {
    return apiClient.post('/wishlist', { product_id: productId });
  },

  removeItem: async (id: number): Promise<any> => {
    return apiClient.delete(`/wishlist/${id}`);
  },
  
  clear: async (): Promise<any> => {
    return apiClient.delete('/wishlist');
  }
};
