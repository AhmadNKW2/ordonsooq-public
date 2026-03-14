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

function toVariantCardProduct(base: Product, variant: ProductVariant, listSeparatelyAttrs: string[] = []): Product {
  const variantImage = getVariantPrimaryImage(base, variant);
  const images = variantImage
    ? [variantImage, ...(base.images || []).filter((u) => u !== variantImage)]
    : base.images;

  // Append attribute values to the name
  const attributeValues = listSeparatelyAttrs.length > 0 
    ? listSeparatelyAttrs.map((attr) => variant.attributes?.[attr]).filter(Boolean)
    : Object.values(variant.attributes || {}).filter(Boolean);
  const newName = attributeValues.length > 0
    ? `${base.name} - ${attributeValues.join(' - ')}`
    : base.name;

  return {
    ...base,
    name: newName,
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
        const listSeparatelyAttrs = p.attributes?.filter(a => a.listSeparately).map(a => a.name) || [];
        
        if (listSeparatelyAttrs.length > 0) {
          const inStockVariants = variants.filter((v) => (v.stock ?? 0) > 0);
          if (inStockVariants.length === 0) return [p];

          // Group variants by the values of the listSeparately attributes
          const groupedVariants = new Map<string, ProductVariant>();
          
          for (const variant of inStockVariants) {
            // Create a unique key for the variant based on the listSeparately attributes
            const keyParts = listSeparatelyAttrs.map(attrName => variant.attributes[attrName] || '');
            const key = keyParts.join('||');
            
            if (!groupedVariants.has(key)) {
              groupedVariants.set(key, variant);
            }
          }
          
          return Array.from(groupedVariants.values()).map((v) => toVariantCardProduct(p, v, listSeparatelyAttrs));
        }
        
        // If there are variants but no listSeparately attributes, return just the base product
        return [p];
      }

      return [p];
    });
  }, [baseProducts]);

  return {
    products: expandedProducts,
    isLoading: false,
  };
}
