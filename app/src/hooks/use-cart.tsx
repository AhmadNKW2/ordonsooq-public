"use client";

import { createContext, useContext, ReactNode, useCallback, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { Cart, CartItem, Product, ProductVariant } from "@/types";
import { useAuth } from "./useAuth";
import { cartService } from "@/services/cart.service";
import { useQuery, useMutation, useQueryClient, useQueries } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import { PRODUCT_QUERY_KEYS } from "@/hooks/useProducts";
import { transformProduct, type Locale } from "@/lib/transformers";

interface CartContextType {
  items: CartItem[];
  cart: Cart | undefined;
  isLoading: boolean;
  isOpen: boolean;
  totalItems: number;
  totalAmount: number;
  addItem: (product: Product, quantity: number, variantId?: number | string, options?: { openSidebar?: boolean; onSuccess?: () => void }) => void;
  removeItem: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  // Aliases/Helpers for backward compatibility
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const activeLocale = useLocale();
  const locale: Locale = activeLocale === "ar" ? "ar" : "en";

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: cartService.getCart,
    enabled: isAuthenticated,
  });

  const cartItems = cart?.items || [];

  const getVariantPrimaryImage = (product: Product, variant: ProductVariant): string | undefined => {
    const mainImage = product.images?.[0];
    const mediaAttribute = product.attributes?.find((a) => a.controlsMedia);
    if (!mediaAttribute) return mainImage;

    const selectedValue = variant.attributes?.[mediaAttribute.name];
    if (!selectedValue) return mainImage;

    const attributeValue = mediaAttribute.values.find((v) => v.value === selectedValue);
    return attributeValue?.image || mainImage;
  };

  const cartVariantProductIds = useMemo(() => {
    const ids = new Set<number>();
    for (const item of cartItems) {
      if (item?.variant_id) ids.add(item.product_id);
    }
    return Array.from(ids);
  }, [cartItems]);

  const cartVariantDetailQueries = useQueries({
    queries: cartVariantProductIds.map((id) => ({
      queryKey: PRODUCT_QUERY_KEYS.detail(id),
      queryFn: () => productService.getById(id),
      enabled: isAuthenticated && cartVariantProductIds.length > 0,
    })),
  });

  const enrichedCartItems = useMemo(() => {
    if (cartItems.length === 0) return cartItems;
    if (cartVariantProductIds.length === 0) return cartItems;

    const detailById = new Map<number, any>();
    for (const q of cartVariantDetailQueries) {
      const d = q.data as any;
      if (d && typeof d.id === "number") detailById.set(d.id, d);
    }

    return cartItems.map((item) => {
      if (!item?.variant_id) return item;

      const detail = detailById.get(item.product_id);
      if (!detail) return item;

      const full = transformProduct(detail, locale);
      const variant = full.variants?.find((v) => String(v.id) === String(item.variant_id));
      if (!variant) return item;

      const variantImage = getVariantPrimaryImage(full, variant);
      if (!variantImage) return item;

      return {
        ...item,
        product: {
          ...item.product,
          image: variantImage,
        },
      };
    });
  }, [cartItems, cartVariantDetailQueries, cartVariantProductIds.length, locale]);

  const toNumber = (value: unknown): number => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const n = Number(value);
      return Number.isFinite(n) ? n : NaN;
    }
    return NaN;
  };

  const getEffectiveUnitPrice = (item: CartItem): number => {
    const variant: any = (item as any)?.variant;
    const product: any = (item as any)?.product;

    const pick = (entity: any): number => {
      const price = toNumber(entity?.price);
      const salePrice = toNumber(entity?.sale_price);
      if (Number.isFinite(salePrice) && Number.isFinite(price) && salePrice > 0 && salePrice < price) return salePrice;
      return Number.isFinite(price) ? price : 0;
    };

    return variant ? pick(variant) : pick(product);
  };

  const computedTotalAmount = cartItems.reduce((sum, item) => sum + getEffectiveUnitPrice(item) * item.quantity, 0);
  const totalAmount = cartItems.length > 0 ? computedTotalAmount : (cart?.total_amount || 0);
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Helpers
  const toggleCart = () => setIsOpen(prev => !prev);
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const setCartCache = useCallback(
    (updater: (old: Cart | undefined) => Cart | undefined) => {
      queryClient.setQueryData(["cart"], updater);
    },
    [queryClient]
  );

  const addItemMutation = useMutation({
    mutationFn: (data: { product: Product; quantity: number; variantId?: number | string; options?: { openSidebar?: boolean; onSuccess?: () => void } }) => {
      const vId = data.variantId
        ? typeof data.variantId === "string"
          ? parseInt(data.variantId, 10)
          : data.variantId
        : undefined;

      return cartService.addItem({
        product_id: parseInt(String(data.product.id), 10),
        quantity: data.quantity,
        variant_id: vId,
      });
    },
    onSuccess: (response, variables) => {
      if (response && (response as any).items) {
        setCartCache(() => response as any);
      } else {
        // Best-effort optimistic update without triggering extra requests
        setCartCache((old) => {
          if (!old) return old;
          const productId = parseInt(String(variables.product.id), 10);
          const variantId = variables.variantId
            ? typeof variables.variantId === "string"
              ? parseInt(variables.variantId, 10)
              : variables.variantId
            : null;

          const nextItems = old.items.map((i) => ({ ...i }));
          const existing = nextItems.find(
            (i) => i.product_id === productId && (i.variant_id ?? null) === (variantId ?? null)
          );

          if (existing) {
            existing.quantity += variables.quantity;
          }

          return { ...old, items: nextItems };
        });
      }

      if (variables.options?.openSidebar !== false) {
        setIsOpen(true);
      }
      
      variables.options?.onSuccess?.();
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: (data: { itemId: number; quantity: number }) =>
      cartService.updateItem(data.itemId, data.quantity),
    onSuccess: (response, variables) => {
      if (response && (response as any).items) {
        setCartCache(() => response as any);
        return;
      }

      setCartCache((old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((i) => (i.id === variables.itemId ? { ...i, quantity: variables.quantity } : i)),
        };
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId: number) => cartService.removeItem(itemId),
    onSuccess: (response, itemId) => {
      if (response && (response as any).items) {
        setCartCache(() => response as any);
        return;
      }

      setCartCache((old) => {
        if (!old) return old;
        return { ...old, items: old.items.filter((i) => i.id !== itemId) };
      });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: cartService.clear,
    onSuccess: () => {
      setCartCache((old) => {
        if (!old) return old;
        return { ...old, items: [], total_amount: 0 };
      });
    },
  });

  const addItem = useCallback(
    (product: Product, quantity: number, variantId?: number | string, options?: { openSidebar?: boolean; onSuccess?: () => void }) => {
      if (!isAuthenticated) return;
      addItemMutation.mutate({ product, quantity, variantId, options });
    },
    [addItemMutation, isAuthenticated]
  );

  const updateQuantity = useCallback((itemId: number, quantity: number) => {
      if (!isAuthenticated) return;
      if (quantity <= 0) {
          removeItemMutation.mutate(itemId);
          return;
      }
      updateQuantityMutation.mutate({ itemId, quantity });
  }, [updateQuantityMutation, removeItemMutation, isAuthenticated]);

  const removeItem = useCallback((itemId: number) => {
      if (!isAuthenticated) return;
      removeItemMutation.mutate(itemId);
  }, [removeItemMutation, isAuthenticated]);

  const clearCart = useCallback(() => {
      if (!isAuthenticated) return;
      clearCartMutation.mutate();
  }, [clearCartMutation, isAuthenticated]);

  return (
    <CartContext.Provider
      value={{
        items: enrichedCartItems,
        cart,
        isLoading,
        isOpen,
        totalItems,
        totalAmount,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        setIsOpen,
        toggleCart,
        openCart,
        closeCart,
        totalPrice: totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
