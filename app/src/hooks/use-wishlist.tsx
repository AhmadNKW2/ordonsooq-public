"use client";

import { createContext, useContext, ReactNode, useCallback } from "react";
import { WishlistItem, WishlistResponse, WishlistUpdateResponse, Product, CartProduct, WishlistProduct } from "@/types";
import { useAuth } from "./useAuth";
import { wishlistService } from "@/services/wishlist.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthModal } from "@/contexts/auth-modal-context";

type WishlistInputProduct = Product | CartProduct | WishlistProduct;

interface WishlistContextType {
  items: WishlistItem[];
  isLoading: boolean;
  total: number;
  addItem: (product: WishlistInputProduct, variantId?: number | null) => void;
  removeItem: (productId: number, variantId?: number | null) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string | number, variantId?: string | number | null) => boolean;
  isItemLoading: (productId: string | number, variantId?: string | number | null) => boolean;
  toggleItem: (product: WishlistInputProduct, variantId?: number | null) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { openAuthModal } = useAuthModal();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: wishlistService.getWishlist,
    enabled: isAuthenticated,
  });

  const wishlistItems = data?.data || [];
  const wishlistTotal = data?.total || 0;

  const addItemMutation = useMutation({
    mutationFn: (vars: { productId: number; variantId?: number | null }) => 
        wishlistService.addItem(vars.productId, vars.variantId),
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: ['wishlist'] });
      const prevData = queryClient.getQueryData<WishlistResponse>(['wishlist']);

      if (prevData) {
        const optimisticItem: WishlistItem = {
          id: -Date.now(),
          product_id: vars.productId,
          variant_id: vars.variantId ?? null,
          created_at: new Date().toISOString(),
          product: {
            id: vars.productId,
            name_en: "",
            name_ar: "",
            price: 0,
            image: "",
          },
        };

        queryClient.setQueryData<WishlistResponse>(['wishlist'], {
          ...prevData,
          data: [optimisticItem, ...prevData.data],
          total: prevData.total + 1,
        });
      }

      return { prevData };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prevData) {
        queryClient.setQueryData(['wishlist'], ctx.prevData);
      }
    },
    onSuccess: (payload: WishlistUpdateResponse) => {
      // IMPORTANT: Do not refetch (no GET /wishlist). Use server response instead.
      const items = payload?.items;
      if (items?.data) {
        queryClient.setQueryData<WishlistResponse>(['wishlist'], {
          data: items.data,
          total: items.total ?? items.data.length,
        });
        return;
      }

      // Fallback: if backend shape changes, at least ensure consistency.
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: (vars: { productId: number; variantId?: number | null }) => 
        wishlistService.removeItem(vars.productId, vars.variantId),
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: ['wishlist'] });
      const prevData = queryClient.getQueryData<WishlistResponse>(['wishlist']);

      if (prevData) {
        const newItems = prevData.data.filter((item) => {
             if (vars.variantId != null) {
               return !(item.product_id === vars.productId && item.variant_id === vars.variantId);
             }
             return !(item.product_id === vars.productId && item.variant_id == null);
         });
         
        queryClient.setQueryData<WishlistResponse>(['wishlist'], {
          ...prevData,
          data: newItems,
          total: newItems.length,
        });
      }

      return { prevData };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prevData) {
        queryClient.setQueryData(['wishlist'], ctx.prevData);
      }
    },
    onSuccess: (response, vars) => {
       // We already optimistically removed it, but let's confirm with server data if available
       // or just invalidate to be safe if strictly required, but usually optimistic is enough for delete.
       // However, since we might want to sync total count accurately from server if possible,
       // we can stick with the optimistic result or update from response if response structure allows.
       
       // For now, let's trust the optimistic update was correct, 
       // but strictly ensuring the cache is correct via the logic below which basically repeats the filter
       // or just lets the query settle.
       
       // Note: reusing the logic from previous simplified version ensuring the cache is definitely correct:
       const prevData = queryClient.getQueryData<WishlistResponse>(['wishlist']);
       if (prevData) {
         const newItems = prevData.data.filter((item) => {
             // Handle optimistic temporary IDs if necessary, though usually we filter by product_id/variant_id
             if (vars.variantId != null) {
               return !(item.product_id === vars.productId && item.variant_id === vars.variantId);
             }
             return !(item.product_id === vars.productId && item.variant_id == null);
         });
         queryClient.setQueryData(['wishlist'], {
             ...prevData,
             data: newItems,
             total: newItems.length
         });
       }
    },
  });

  const clearMutation = useMutation({
    mutationFn: wishlistService.clear,
    onSuccess: () => {
        queryClient.setQueryData(['wishlist'], { data: [], total: 0 });
    }
  });

  const isInWishlist = useCallback((productId: string | number, variantId?: string | number | null) => {
      const pId = typeof productId === 'string' ? parseInt(productId, 10) : productId;
      const vId = variantId != null
        ? (typeof variantId === 'string' ? parseInt(variantId, 10) : variantId)
        : null;

      return wishlistItems.some(item => {
          if (vId != null) return item.product_id === pId && item.variant_id === vId;
          return item.product_id === pId && item.variant_id == null;
      });
  }, [wishlistItems]);

  const addItem = useCallback((product: WishlistInputProduct, variantId?: number | null) => {
    if (!isAuthenticated) {
        openAuthModal();
        return;
    }
    const productId = typeof product.id === 'string' ? parseInt(product.id, 10) : product.id;
    
    if (isInWishlist(productId, variantId)) return;

    addItemMutation.mutate({ productId, variantId });
  }, [isAuthenticated, openAuthModal, isInWishlist, addItemMutation]);

    const removeItem = useCallback((productId: number, variantId?: number | null) => {
     if (!isAuthenticated) return;
      removeItemMutation.mutate({ productId, variantId });
  }, [removeItemMutation, isAuthenticated]);

  const clearWishlist = useCallback(() => {
    if (!isAuthenticated) return;
    clearMutation.mutate();
  }, [clearMutation, isAuthenticated]);

  const toggleItem = useCallback((product: WishlistInputProduct, variantId?: number | null) => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    const productId = typeof product.id === 'string' ? parseInt(product.id, 10) : product.id;
    
    if (isInWishlist(productId, variantId)) {
      removeItem(productId, variantId);
    } else {
      addItem(product, variantId);
    }
  }, [isInWishlist, removeItem, addItem, isAuthenticated, openAuthModal]);

  const isItemLoading = useCallback((productId: string | number, variantId?: string | number | null) => {
    const pId = typeof productId === 'string' ? parseInt(productId, 10) : productId;
    const vId = variantId != null
      ? (typeof variantId === 'string' ? parseInt(variantId, 10) : variantId)
      : null; // Explicit null if undefined

    const isAdding = addItemMutation.isPending && 
      addItemMutation.variables?.productId === pId && 
      (addItemMutation.variables?.variantId ?? null) === vId;
      
    const isRemoving = removeItemMutation.isPending &&
      removeItemMutation.variables?.productId === pId &&
      (removeItemMutation.variables?.variantId ?? null) === vId;

      return isAdding || isRemoving;
  }, [addItemMutation.isPending, addItemMutation.variables, removeItemMutation.isPending, removeItemMutation.variables]);

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
        isItemLoading,
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
