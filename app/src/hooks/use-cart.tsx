"use client";

import { createContext, useContext, ReactNode, useCallback, useMemo, useRef, useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { Cart, CartItem, Product, ProductVariant } from "@/types";
import { useAuth } from "./useAuth";
import { cartService } from "@/services/cart.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

function getCartItemKey(productId: number | string, variantId?: number | string | null) {
  return `${productId}:${variantId ?? "base"}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const activeLocale = useLocale();
  const locale: Locale = activeLocale === "ar" ? "ar" : "en";
  const [guestItems, setGuestItems] = useState<CartItem[]>([]);
  const [loadingItems, setLoadingItems] = useState<Set<number>>(new Set());
  const [lastAddedItemKey, setLastAddedItemKey] = useState<string | null>(null);
  const guestCartSyncPromiseRef = useRef<Promise<void> | null>(null);

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

  /**
   * The cart API returns product images under various field names
   * (primary_image, image_url, images[], etc.) instead of the `image`
   * field expected by CartProduct. This normalizes any item from the API
   * so that `item.product.image` is always a usable URL string.
   */
  const normalizeCartItem = (item: any): CartItem => {
    const p = item.product || {};
    let image: string = p.image || '';
    if (!image) {
      if (typeof p.primary_image === 'string') {
        image = p.primary_image;
      } else if (p.primary_image?.url) {
        image = p.primary_image.url;
      } else if (Array.isArray(p.images) && p.images[0]) {
        image = typeof p.images[0] === 'string' ? p.images[0] : p.images[0]?.url || '';
      } else if (typeof p.image_url === 'string') {
        image = p.image_url;
      }
    }
    return {
      ...item,
      product: { ...p, image },
    };
  };

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

  const buildFallbackVariantAttributes = (variant: ProductVariant | undefined) => {
    if (!variant?.attributes) return [];

    return Object.entries(variant.attributes).map(([attributeName, value]) => ({
      attribute_name_en: attributeName,
      attribute_name_ar: attributeName,
      value_en: value,
      value_ar: value,
    }));
  };

  const buildLocalizedVariantAttributes = (apiProduct: any, variantId?: number | string | null) => {
    if (variantId == null) return [];

    const variant = apiProduct?.variants?.find((candidate: any) => String(candidate?.id) === String(variantId));
    if (!variant?.attribute_values || typeof variant.attribute_values !== "object") {
      return [];
    }

    return Object.entries(variant.attribute_values).map(([attributeId, valueId]) => {
      const attributeGroup = apiProduct?.attributes?.[attributeId] ?? apiProduct?.specifications?.[attributeId];
      const valueGroup = attributeGroup?.values?.[String(valueId)];

      const attributeNameEn = attributeGroup?.name_en?.trim() || attributeGroup?.name_ar?.trim() || attributeId;
      const attributeNameAr = attributeGroup?.name_ar?.trim() || attributeGroup?.name_en?.trim() || attributeNameEn;
      const valueEn = valueGroup?.name_en?.trim() || valueGroup?.name_ar?.trim() || String(valueId);
      const valueAr = valueGroup?.name_ar?.trim() || valueGroup?.name_en?.trim() || valueEn;

      return {
        attribute_name_en: attributeNameEn,
        attribute_name_ar: attributeNameAr,
        value_en: valueEn,
        value_ar: valueAr,
        color_code: valueGroup?.color_code ?? undefined,
      };
    });
  };

  const buildGuestCartItem = useCallback(async (
    sourceProduct: Product,
    quantity: number,
    variantId?: number | string | null,
    existingId?: number,
  ): Promise<CartItem> => {
    const productId = parseInt(String(sourceProduct.id), 10);
    const normalizedVariantId = variantId != null
      ? typeof variantId === "string"
        ? parseInt(variantId, 10)
        : variantId
      : null;

    const apiProduct = await queryClient.ensureQueryData({
      queryKey: PRODUCT_QUERY_KEYS.detail(productId),
      queryFn: () => productService.getById(productId),
    }).catch(() => undefined);

    const transformedProduct = apiProduct ? transformProduct(apiProduct, locale) : sourceProduct;
    const resolvedVariant = transformedProduct.variants?.find((candidate) => String(candidate.id) === String(normalizedVariantId));
    const selectedImage = resolvedVariant
      ? getVariantPrimaryImage(transformedProduct, resolvedVariant) || resolvedVariant.image || transformedProduct.images?.[0] || ""
      : transformedProduct.images?.[0] || "";

    return {
      id: existingId ?? Date.now(),
      product_id: productId,
      variant_id: normalizedVariantId,
      quantity,
      product: {
        id: productId,
        name_en: apiProduct?.name_en?.trim() || sourceProduct.name || sourceProduct.nameAr || "",
        name_ar: apiProduct?.name_ar?.trim() || sourceProduct.nameAr || sourceProduct.name || "",
        price: transformedProduct.price,
        sale_price: transformedProduct.compareAtPrice,
        image: selectedImage,
        slug: apiProduct?.slug?.trim() || sourceProduct.slug,
        stock: transformedProduct.stock,
      },
      variant: resolvedVariant ? {
        id: typeof resolvedVariant.id === "string" ? parseInt(resolvedVariant.id, 10) : resolvedVariant.id,
        sku: resolvedVariant.sku,
        price: resolvedVariant.price,
        compareAtPrice: resolvedVariant.compareAtPrice,
        sale_price: resolvedVariant.compareAtPrice,
        stock: resolvedVariant.stock,
        attributes: apiProduct
          ? buildLocalizedVariantAttributes(apiProduct, normalizedVariantId)
          : buildFallbackVariantAttributes(resolvedVariant),
      } : null,
    };
  }, [locale, queryClient]);

  const baseCartItems = isAuthenticated
    ? (cart?.items || []).map(normalizeCartItem)
    : guestItems;

  const cartItems = useMemo(() => {
    if (!lastAddedItemKey) {
      return baseCartItems;
    }

    const promotedItem = baseCartItems.find((item) => getCartItemKey(item.product_id, item.variant_id) === lastAddedItemKey);
    if (!promotedItem) {
      return baseCartItems;
    }

    return [
      promotedItem,
      ...baseCartItems.filter((item) => item !== promotedItem),
    ];
  }, [baseCartItems, lastAddedItemKey]);

  const computedTotalAmount = cartItems.reduce((sum, item) => sum + getEffectiveUnitPrice(item) * item.quantity, 0);
  const totalAmount = cartItems.length > 0 ? computedTotalAmount : (cart?.total_amount || 0);
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    if (isAuthenticated || guestItems.length === 0) {
      return;
    }

    const itemsNeedingHydration = guestItems.filter((item) => {
      const missingProductLocale = !item.product.name_ar || !item.product.slug;
      const missingVariantLocale = item.variant?.attributes?.some((attribute) => !attribute.attribute_name_ar || !attribute.value_ar);
      return missingProductLocale || missingVariantLocale;
    });

    if (itemsNeedingHydration.length === 0) {
      return;
    }

    let isCancelled = false;

    void Promise.all(
      guestItems.map(async (item) => {
        const shouldHydrate = itemsNeedingHydration.some((candidate) => candidate.id === item.id);
        if (!shouldHydrate) {
          return item;
        }

        const sourceProduct = await queryClient.ensureQueryData({
          queryKey: PRODUCT_QUERY_KEYS.detail(item.product_id),
          queryFn: () => productService.getById(item.product_id),
        }).then((apiProduct) => transformProduct(apiProduct, locale)).catch(() => undefined);

        if (!sourceProduct) {
          return item;
        }

        return buildGuestCartItem(sourceProduct, item.quantity, item.variant_id, item.id);
      })
    ).then((hydratedItems) => {
      if (isCancelled) {
        return;
      }

      const didChange = JSON.stringify(hydratedItems) !== JSON.stringify(guestItems);
      if (didChange) {
        saveGuestCart(hydratedItems);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [buildGuestCartItem, guestItems, isAuthenticated, locale, queryClient]);

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
          const newItem = await buildGuestCartItem(data.product, data.quantity, vId ?? null);
          newItems = [newItem, ...newItems];
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
      setLastAddedItemKey(getCartItemKey(variables.product.id, variables.variantId ?? null));

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

      const shouldOpenSidebar =
        variables.options?.openSidebar
        ?? (typeof window !== "undefined" ? window.innerWidth >= 1024 : false);

      if (shouldOpenSidebar) {
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

    if (guestCartSyncPromiseRef.current) {
      await guestCartSyncPromiseRef.current;
      return;
    }

    const syncPromise = (async () => {
      try {
        const remainingItems: CartItem[] = [];

        for (let index = 0; index < guestItems.length; index += 1) {
          const item = guestItems[index];

          try {
            await cartService.addItem({
              product_id: item.product_id,
              quantity: item.quantity,
              variant_id: item.variant_id ?? undefined,
            });
          } catch (error) {
            console.error("Failed to sync item", item, error);
            remainingItems.push(...guestItems.slice(index));
            break;
          }
        }

        saveGuestCart(remainingItems);

        if (remainingItems.length !== guestItems.length) {
          await queryClient.invalidateQueries({ queryKey: ["cart"] });
        }
      } catch (error) {
        console.error("Sync failed", error);
      }
    })();

    guestCartSyncPromiseRef.current = syncPromise;

    try {
      await syncPromise;
    } finally {
      guestCartSyncPromiseRef.current = null;
    }
  }, [guestItems, queryClient]);

  useEffect(() => {
    if (!isAuthenticated || guestItems.length === 0) {
      return;
    }

    void syncGuestCart();
  }, [guestItems.length, isAuthenticated, syncGuestCart]);


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
      setLastAddedItemKey(null);
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
