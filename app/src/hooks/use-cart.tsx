"use client";

import { createContext, useContext, ReactNode, useCallback, useMemo, useState, useEffect } from "react";
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
  addItem: (
    product: Product,
    quantity: number,
    variantId?: number | string,
    options?: { openSidebar?: boolean; onSuccess?: () => void; onError?: (error: unknown) => void }
  ) => void;
  removeItem: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number, options?: { onSuccess?: () => void; onError?: (error: unknown) => void }) => void;
  clearCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  // Aliases/Helpers for backward compatibility
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalPrice: number;
  syncGuestCart: () => Promise<void>;
  loadingItems: Set<number>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const GUEST_CART_KEY = "ordonsooq-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const activeLocale = useLocale();
  const locale: Locale = activeLocale === "ar" ? "ar" : "en";
  const [guestItems, setGuestItems] = useState<CartItem[]>([]);
  const [loadingItems, setLoadingItems] = useState<Set<number>>(new Set());

  // Load guest cart on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(GUEST_CART_KEY);
      if (stored) {
        try {
          setGuestItems(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse guest cart", e);
        }
      }
    }
  }, []);

  const saveGuestCart = (items: CartItem[]) => {
    setGuestItems(items);
    if (typeof window !== 'undefined') {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    }
  };

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: cartService.getCart,
    enabled: isAuthenticated,
  });

  const cartItems = isAuthenticated ? (cart?.items || []) : guestItems;

  const getVariantPrimaryImage = (product: Product, variant: ProductVariant): string | undefined => {
    const mainImage = product.images?.[0];
    const mediaAttribute = product.attributes?.find((a) => a.controlsMedia);
    if (!mediaAttribute) return mainImage;

    const selectedValue = variant.attributes?.[mediaAttribute.name];
    if (!selectedValue) return mainImage;

    const attributeValue = mediaAttribute.values.find((v) => v.value === selectedValue);
    return attributeValue?.image || mainImage;
  };

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
    mutationFn: async (data: { product: Product; quantity: number; variantId?: number | string; options?: { openSidebar?: boolean; onSuccess?: () => void; onError?: (error: unknown) => void } }) => {
      const vId = data.variantId
        ? typeof data.variantId === "string"
          ? parseInt(data.variantId, 10)
          : data.variantId
        : null; // Use null to match types

      if (!isAuthenticated) {
        // Guest Cart Logic
        let currentItems = [...guestItems];
        // Ensure we have the latest items from localStorage to prevent stale closures
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem(GUEST_CART_KEY);
          if (stored) {
            try {
              currentItems = JSON.parse(stored);
            } catch (e) {
              // ignore error
            }
          }
        }

        const productId = parseInt(String(data.product.id), 10);
        const existingItemIndex = currentItems.findIndex(
          item => item.product_id === productId && (item.variant_id ?? null) === (vId ?? null)
        );

        let newItems = [...currentItems];

        if (existingItemIndex >= 0) {
          newItems[existingItemIndex] = {
            ...newItems[existingItemIndex],
            quantity: newItems[existingItemIndex].quantity + data.quantity
          };
        } else {
            // Construct CartItem
            const variantObj = data.product.variants?.find(v => String(v.id) === String(vId));
            
            let selectedImage = data.product.images?.[0] || "";
            const cartVariantAttributes: any[] = []; // CartVariantAttribute[]

            if (variantObj) {
                // 1. Check if variant has specific image
                if (variantObj.image) {
                    selectedImage = variantObj.image;
                }

                // 2. Resolve Attributes and check for controlled media
                if (variantObj.attributes) {
                    Object.entries(variantObj.attributes).forEach(([key, value]) => {
                        const attrDef = data.product.attributes?.find(a => a.name === key);
                        
                        // Image Logic - if attribute controls media and we haven't already used variant.image (or maybe this overrides?)
                        // Usually variant.image (if specific) is best. If not, look at attribute media.
                        if (!variantObj.image && attrDef?.controlsMedia) {
                            const valDef = attrDef.values.find(v => v.value === value);
                            if (valDef?.image) {
                                selectedImage = valDef.image;
                            }
                        }
                        
                        // Attribute List Logic
                        let colorCode: string | undefined;
                        // For color attributes, try to find meta (hex code)
                        const valDef = attrDef?.values.find(v => v.value === value);
                        if (valDef?.meta) {
                            colorCode = valDef.meta;
                        }

                        cartVariantAttributes.push({
                            attribute_name_en: key,
                            value_en: value,
                            color_code: colorCode 
                        });
                    });
                }
            }
            
            const newItem: CartItem = {
                id: Date.now(), // Temp ID
                product_id: productId,
                variant_id:  vId ?? null,
                quantity: data.quantity,
                product: {
                    id: productId,
                    name_en: data.product.name,
                    price: data.product.price,
                    sale_price: data.product.compareAtPrice,
                    image: selectedImage,
                    slug: data.product.slug,
                },
                variant: variantObj ? {
                    id: typeof variantObj.id === 'string' ? parseInt(variantObj.id) : variantObj.id,
                    sku: variantObj.sku,
                    price: variantObj.price,
                    compareAtPrice: variantObj.compareAtPrice,
                    sale_price: variantObj.compareAtPrice, 
                    attributes: cartVariantAttributes,
                } : null
            };
            newItems.push(newItem);
        }
        
        saveGuestCart(newItems);
        return { items: newItems };
      }

      return cartService.addItem({
        product_id: parseInt(String(data.product.id), 10),
        quantity: data.quantity,
        variant_id: vId || undefined,
      });
    },
    onSuccess: (response, variables) => {
      if (!isAuthenticated) {
         // Guest handled in mutationFn
      } else if (response && (response as any).items) {
        setCartCache(() => response as any);
      } else {
        // Optimistic update
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
    onError: (error, variables) => {
      variables.options?.onError?.(error);
    },
  });

  const updateQuantityMutation = useMutation({
    onMutate: (variables) => {
      setLoadingItems(prev => new Set(prev).add(variables.itemId));
    },
    mutationFn: async (data: { itemId: number; quantity: number; options?: { onSuccess?: () => void; onError?: (error: unknown) => void } }) => {
        if (!isAuthenticated) {
            // Simulate network delay for guest to show animation
            if (typeof window !== 'undefined') {
                 await new Promise(resolve => setTimeout(resolve, 300));
            }
            
            let currentItems = [...guestItems];
            if (typeof window !== 'undefined') {
                const stored = localStorage.getItem(GUEST_CART_KEY);
                if (stored) {
                    try {
                        currentItems = JSON.parse(stored);
                    } catch (e) {}
                }
            }

            const newItems = currentItems.map(item => 
                item.id === data.itemId ? { ...item, quantity: data.quantity } : item
            );
            saveGuestCart(newItems);
            return { items: newItems };
        }
        return cartService.updateItem(data.itemId, data.quantity);
    },
    onSettled: (data, error, variables) => {
        setLoadingItems(prev => {
            const next = new Set(prev);
            next.delete(variables.itemId);
            return next;
        });
    },
    onError: (error, variables) => {
        variables.options?.onError?.(error);
    },
    onSuccess: (response, variables) => {
      variables.options?.onSuccess?.();
      if (!isAuthenticated) return;
      
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
    mutationFn: async (itemId: number) => {
        if (!isAuthenticated) {
            let currentItems = [...guestItems];
            if (typeof window !== 'undefined') {
                const stored = localStorage.getItem(GUEST_CART_KEY);
                if (stored) {
                    try {
                        currentItems = JSON.parse(stored);
                    } catch (e) {}
                }
            }
            const newItems = currentItems.filter(item => item.id !== itemId);
            saveGuestCart(newItems);
            return { items: newItems };
        }
        return cartService.removeItem(itemId);
    },
    onSuccess: (response, itemId) => {
      if (!isAuthenticated) return;

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
    mutationFn: async () => {
        if(!isAuthenticated) {
            saveGuestCart([]);
            return;
        }
        return cartService.clear();
    },
    onSuccess: () => {
      if (!isAuthenticated) return;
      setCartCache((old) => {
        if (!old) return old;
        return { ...old, items: [], total_amount: 0 };
      });
    },
  });

  const syncGuestCart = useCallback(async () => {
    if (guestItems.length === 0) return;
    
    try {
        for (const item of guestItems) {
            try {
                await cartService.addItem({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    variant_id: item.variant_id ?? undefined
                });
            } catch (e) {
                console.error("Failed to sync item", item, e);
            }
        }
        saveGuestCart([]);
        queryClient.invalidateQueries({ queryKey: ['cart'] });
    } catch (e) {
        console.error("Sync failed", e);
    }
  }, [guestItems, queryClient]);


  const addItem = useCallback(
    (product: Product, quantity: number, variantId?: number | string, options?: { openSidebar?: boolean; onSuccess?: () => void; onError?: (error: unknown) => void }) => {
      addItemMutation.mutate({ product, quantity, variantId, options });
    },
    [addItemMutation]
  );

  const updateQuantity = useCallback((itemId: number, quantity: number, options?: { onSuccess?: () => void; onError?: (error: unknown) => void }) => {
      if (quantity <= 0) {
          removeItemMutation.mutate(itemId);
          options?.onSuccess?.();
          return;
      }
      updateQuantityMutation.mutate({ itemId, quantity, options });
  }, [updateQuantityMutation, removeItemMutation]);

  const removeItem = useCallback((itemId: number) => {
      removeItemMutation.mutate(itemId);
  }, [removeItemMutation]);

  const clearCart = useCallback(() => {
      clearCartMutation.mutate();
  }, [clearCartMutation]);

  return (
    <CartContext.Provider
      value={{
        items: cartItems,
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
        syncGuestCart,
        loadingItems,
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
