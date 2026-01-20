import { useMemo } from "react";

import { transformProducts, type Locale } from "@/lib/transformers";
import type { Product, ProductVariant } from "@/types";
import type { Product as ApiProduct } from "@/types/api.types";

function getVariantPrimaryImage(product: Product, variant: ProductVariant): string | undefined {
  if (variant.image) return variant.image;

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
    images: images || [], // Ensure images is never undefined
  };
}

export function useListingVariantProducts(apiProducts: ApiProduct[] | undefined, locale: Locale) {
  const baseProducts = useMemo(() => {
    return apiProducts ? transformProducts(apiProducts, locale) : [];
  }, [apiProducts, locale]);

  const expandedProducts = useMemo(() => {
    return baseProducts.flatMap((p) => {
      const variants = p.variants || [];
      const hasVariants = variants.length > 0;
      
      if (hasVariants) {
        const inStockVariants = variants.filter((v) => (v.stock ?? 0) > 0);
        if (inStockVariants.length === 0) return [p];
        return inStockVariants.map((v) => toVariantCardProduct(p, v));
      }

      return [p];
    });
  }, [baseProducts]);

  return {
    products: expandedProducts,
    isLoading: false,
  };
}
