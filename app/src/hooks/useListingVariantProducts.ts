import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";

import { productService } from "@/services/product.service";
import { PRODUCT_QUERY_KEYS } from "@/hooks/useProducts";
import { transformProduct, transformProducts, type Locale } from "@/lib/transformers";
import type { Product, ProductVariant } from "@/types";
import type { Product as ApiProduct, ProductDetail } from "@/types/api.types";

function getVariantPrimaryImage(product: Product, variant: ProductVariant): string | undefined {
  const mainImage = product.images?.[0];
  const mediaAttribute = product.attributes?.find((a) => a.controlsMedia);

  if (!mediaAttribute) return mainImage;

  const selectedValue = variant.attributes?.[mediaAttribute.name];
  if (!selectedValue) return mainImage;

  const attributeValue = mediaAttribute.values.find((v) => v.value === selectedValue);
  return attributeValue?.image || mainImage;
}

function toVariantCardProduct(base: Product, variant: ProductVariant): Product {
  const variantImage = getVariantPrimaryImage(base, variant);
  const images = variantImage
    ? [variantImage, ...(base.images || []).filter((u) => u !== variantImage)]
    : base.images;

  return {
    ...base,
    hasVariants: true,
    defaultVariantId: String(variant.id),
    price: variant.price,
    compareAtPrice: variant.compareAtPrice,
    stock: variant.stock,
    images,
  };
}

export function useListingVariantProducts(apiProducts: ApiProduct[] | undefined, locale: Locale) {
  const baseProducts = useMemo(() => {
    return apiProducts ? transformProducts(apiProducts, locale) : [];
  }, [apiProducts, locale]);

  const variantProductIds = useMemo(() => {
    return baseProducts
      .filter((p) => (p.variantIds?.length ?? 0) > 0 || (p.variants?.length ?? 0) > 0 || !!p.hasVariants)
      .map((p) => parseInt(String(p.id), 10))
      .filter((id) => Number.isFinite(id) && id > 0);
  }, [baseProducts]);

  const detailQueries = useQueries({
    queries: variantProductIds.map((id) => ({
      queryKey: PRODUCT_QUERY_KEYS.detail(id),
      queryFn: () => productService.getById(id),
      enabled: !!apiProducts && apiProducts.length > 0,
    })),
  });

  const isVariantsLoading = detailQueries.some((q) => q.isLoading);

  const expandedProducts = useMemo(() => {
    if (!apiProducts) return [] as Product[];

    const detailById = new Map<number, ProductDetail>();
    detailQueries.forEach((q) => {
      const detail = q.data as ProductDetail | undefined;
      if (detail && typeof (detail as any).id === "number") {
        detailById.set((detail as any).id, detail);
      }
    });

    return baseProducts.flatMap((p) => {
      const id = parseInt(String(p.id), 10);
      const ReliesOnVariants = (p.variantIds?.length ?? 0) > 0 || (p.variants?.length ?? 0) > 0 || !!p.hasVariants;

      if (!ReliesOnVariants) return [p];

      const detail = detailById.get(id);
      if (!detail) return [];

      const full = transformProduct(detail, locale);
      const variants = full.variants || [];

      // Only show available (in-stock) variants as individual cards
      const inStockVariants = variants.filter((v) => (v.stock ?? 0) > 0);
      if (inStockVariants.length === 0) return [];

      return inStockVariants.map((v) => toVariantCardProduct(full, v));
    });
  }, [apiProducts, baseProducts, detailQueries, locale]);

  return {
    products: expandedProducts,
    isLoading: !!apiProducts && apiProducts.length > 0 ? isVariantsLoading : false,
  };
}
