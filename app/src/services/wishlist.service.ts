import { apiClient } from '@/lib/api-client';
import { WishlistResponse, WishlistUpdateResponse } from '@/types';

export const wishlistService = {
  getWishlist: async (): Promise<WishlistResponse> => {
    return apiClient.get<WishlistResponse>('/wishlist');
  },

  addItem: async (productId: number, variantId?: number | null): Promise<WishlistUpdateResponse> => {
    return apiClient.post<WishlistUpdateResponse>('/wishlist', { 
      product_id: productId,
      variant_id: variantId 
    });
  },

  removeItem: async (productId: number, variantId?: number | null): Promise<any> => {
    let url = `/wishlist/${productId}`;
    if (variantId != null) {
      url += `?variant_id=${variantId}`;
    }
    return apiClient.delete(url);
  },
  
  clear: async (): Promise<any> => {
    return apiClient.delete('/wishlist');
  }
};
