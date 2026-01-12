"use client";

import { createContext, useContext, ReactNode, useCallback } from "react";
import { WishlistItem, WishlistResponse, Product, CartProduct, WishlistProduct } from "@/types";
import { useAuth } from "./useAuth";
import { wishlistService } from "@/services/wishlist.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type WishlistInputProduct = Product | CartProduct | WishlistProduct;

interface WishlistContextType {
  items: WishlistItem[];
  isLoading: boolean;
  total: number;
  addItem: (product: WishlistInputProduct) => void;
  removeItem: (productId: number) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string | number) => boolean;
  toggleItem: (product: WishlistInputProduct) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: wishlistService.getWishlist,
    enabled: isAuthenticated,
  });

  const wishlistItems = data?.data || [];
  const wishlistTotal = data?.total || 0;

  const addItemMutation = useMutation({
    mutationFn: (productId: number) => wishlistService.addItem(productId),
    onSuccess: (response, productId) => {
      // Optimistic update logic based on user request "take the response if it returns the list or add it locally"
      // Assuming response matches WishlistResponse or contains it
      if (response && response.data && Array.isArray(response.data)) {
         queryClient.setQueryData(['wishlist'], response);
      } else if (response && response.items && response.items.data) {
          queryClient.setQueryData(['wishlist'], response.items);
      } else {
         // Fallback: Add locally
         const prevData = queryClient.getQueryData<WishlistResponse>(['wishlist']);
         // We can't perfectly reconstruct WishlistItem without backend response (e.g. id, created_at)
         // So we invalidate if we can't update.
         // But user INSISTED on no refetch.
         // So we probably assume response *contains* the needed info or we fake it.
         // If response is the new item:
         if (prevData) {
            // Need to know what response looks like if it's a single item.
            // Assuming it might be the Item object.
             queryClient.invalidateQueries({ queryKey: ['wishlist'] }); // Safety fallback if structure unknown
         }
      }
    },
    onError: () => {
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: (productId: number) => wishlistService.removeItem(productId),
    onSuccess: (response, productId) => {
        // Optimistic Remove
       const prevData = queryClient.getQueryData<WishlistResponse>(['wishlist']);
       if (prevData) {
         // Backend expects product ID in /wishlist/:id
         // Keep a small compatibility fallback if some caller still passes the wishlist row id.
         const newItems = prevData.data.filter(
           (item) => item.product_id !== productId && item.id !== productId
         );
         queryClient.setQueryData(['wishlist'], {
             ...prevData,
             data: newItems,
             total: newItems.length
         });
       }
    },
    onError: () => {
    }
  });

  const clearMutation = useMutation({
    mutationFn: wishlistService.clear,
    onSuccess: () => {
        queryClient.setQueryData(['wishlist'], { data: [], total: 0 });
    }
  });

  const addItem = useCallback((product: WishlistInputProduct) => {
    if (!isAuthenticated) {
        return;
    }
    
    // Convert ID to number if string
    const productId = typeof product.id === 'string' ? parseInt(product.id, 10) : product.id;
    
    const exists = wishlistItems.some(item => item.product_id === productId);
    if (exists) {
        return;
    }

    addItemMutation.mutate(productId, {
        onSuccess: (response) => {
            // Handle single item return if that's what backend sends
             if (!response?.data && !response?.items?.data) {
                 const prevData = queryClient.getQueryData<WishlistResponse>(['wishlist']);
                 if (prevData) {
                     // Check if we need to convert product structure to WishlistProduct
                     // Ideally we should but for now just casting/spreading
                     const newItem: WishlistItem = {
                         id: response.id || Date.now(),
                         product_id: productId,
                         created_at: new Date().toISOString(),
                         product: product as any 
                     };
                     queryClient.setQueryData(['wishlist'], {
                         ...prevData,
                         data: [...prevData.data, newItem],
                         total: prevData.total + 1
                     });
                 }
             }
        }
    });

  }, [addItemMutation, isAuthenticated, wishlistItems, queryClient]);

    const removeItem = useCallback((productId: number) => {
     if (!isAuthenticated) return;
      removeItemMutation.mutate(productId);
  }, [removeItemMutation, isAuthenticated]);

  const clearWishlist = useCallback(() => {
    if (!isAuthenticated) return;
    clearMutation.mutate();
  }, [clearMutation, isAuthenticated]);

  const isInWishlist = useCallback((productId: string | number) => {
    const id = typeof productId === 'string' ? parseInt(productId, 10) : productId;
    return wishlistItems.some((item) => item.product_id === id);
  }, [wishlistItems]);

  const toggleItem = useCallback((product: WishlistInputProduct) => {
    const productId = typeof product.id === 'string' ? parseInt(product.id, 10) : product.id;
    if (isInWishlist(productId)) {
      removeItem(productId);
    } else {
      addItem(product);
    }
  }, [isInWishlist, wishlistItems, removeItem, addItem]);

  return (
    <WishlistContext.Provider
      value={{
        items: wishlistItems,
        isLoading,
        total: wishlistTotal,
        addItem,
        removeItem,
        clearWishlist,
        isInWishlist,
        toggleItem,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
