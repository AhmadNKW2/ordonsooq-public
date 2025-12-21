/**
 * Transforms API data to frontend types
 * This bridges the gap between backend API responses and frontend UI components
 */

import type { Product as FrontendProduct, Category as FrontendCategory, Vendor as FrontendVendor, Banner as FrontendBanner, Brand as FrontendBrand, ProductDimensions, ProductAttribute } from '@/types';
import type { Product as ApiProduct, ProductDetail, Category as ApiCategory, CategoryDetail, Vendor as ApiVendor, Banner as ApiBanner, HomeData, HomeCategory, HomeVendor, HomeBanner, HomeBrand } from '@/types/api.types';

// Supported locales
export type Locale = 'en' | 'ar';

/**
 * Get localized text based on locale
 */
function getLocalizedText(en: string | null | undefined, ar: string | null | undefined, locale: Locale = 'en'): string {
  if (locale === 'ar') {
    return ar || en || '';
  }
  return en || ar || '';
}

/**
 * Generate a slug from a string (with null safety)
 */
function generateSlug(text: string | null | undefined): string {
  if (!text) return 'item';
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim() || 'item';
}

/**
 * Extract image URL from primary_image (can be string or object)
 */
function extractPrimaryImageUrl(primaryImage: unknown): string | null {
  if (!primaryImage) return null;
  
  // If it's a string, return it
  if (typeof primaryImage === 'string' && primaryImage.trim()) {
    return primaryImage;
  }
  
  // If it's an object with url property
  if (typeof primaryImage === 'object' && primaryImage !== null && 'url' in primaryImage) {
    const url = (primaryImage as { url?: string }).url;
    if (typeof url === 'string' && url.trim()) {
      return url;
    }
  }
  
  return null;
}

/**
 * Transform API Product to Frontend Product
 */
export function transformProduct(apiProduct: ApiProduct | ProductDetail, locale: Locale = 'en'): FrontendProduct {
  // Build images array, filtering out empty strings
  let images: string[] = [];
  
  if ('media' in apiProduct && apiProduct.media && apiProduct.media.length > 0) {
    images = apiProduct.media.map(m => m.url).filter(url => url && typeof url === 'string' && url.trim() !== '');
  }
  
  // Try to get primary image (can be string or object with url)
  if (images.length === 0) {
    const primaryImageUrl = extractPrimaryImageUrl(apiProduct.primary_image);
    if (primaryImageUrl) {
      images = [primaryImageUrl];
    }
  }
  
  // Ensure we always have at least the placeholder
  if (images.length === 0) {
    images = ['/placeholder.svg'];
  }

  let actualPrice = 0;
  let compareAtPrice: number | undefined = undefined;
  const allPrices = (apiProduct as any).prices || [];

  const getPriceValues = (entry: any) => {
    const regPrice = entry?.price ? parseFloat(String(entry.price)) : 0;
    const sPrice = entry?.sale_price ? parseFloat(String(entry.sale_price)) : undefined;
    
    // If sale_price exists and is lower than price, then price is the "compareAt" and sale_price is the "actual"
    const actual = sPrice && sPrice < regPrice ? sPrice : regPrice;
    const compare = sPrice && sPrice < regPrice ? regPrice : undefined;
    
    return { actual, compare };
  };

  // Check for direct price properties first (new API structure)
  if ('price' in apiProduct && apiProduct.price) {
    const price = parseFloat(String(apiProduct.price));
    const salePrice = apiProduct.sale_price ? parseFloat(String(apiProduct.sale_price)) : null;

    if (salePrice !== null && salePrice < price) {
      actualPrice = salePrice;
      compareAtPrice = price;
    } else {
      actualPrice = price;
    }
  } else {
    // Find default price (one without group values or just the first one)
    const defaultPriceEntry = allPrices.find((p: any) => !p.groupValues || p.groupValues.length === 0) || allPrices[0];
    
    const result = getPriceValues(defaultPriceEntry);
    actualPrice = result.actual;
    compareAtPrice = result.compare;
  }

  // Helper to get variant price
  const getVariantPriceData = (v: any) => {
    // 1. Check if variant has specific prices array (unlikely in this API but for safety)
    if (v.prices && v.prices.length > 0) {
      return getPriceValues(v.prices[0]);
    }

    // 2. Find matching price in product.prices based on combinations
    if (allPrices.length > 0 && v.combinations) {
      const matchingPrice = allPrices.find((p: any) => {
        if (!p.groupValues || p.groupValues.length === 0) return false;
        
        // Check if ALL groupValues in the price entry match the variant's combinations
        return p.groupValues.every((gv: any) => 
          v.combinations.some((c: any) => 
            // Use loose equality to handle string/number mismatches
            c.attribute_id == gv.attribute_id && c.attribute_value_id == gv.attribute_value_id
          )
        );
      });

      if (matchingPrice) {
        return getPriceValues(matchingPrice);
      }
    }

    // Fallback to product price
    return { actual: actualPrice, compare: compareAtPrice };
  };

  // Get stock - handle both array format and direct properties
  let stockQuantity = 0;
  if (Array.isArray(apiProduct.stock) && apiProduct.stock.length > 0) {
    // Sum up quantities from all stock entries
    stockQuantity = apiProduct.stock.reduce((total: number, s: any) => {
      return total + (s.quantity || 0);
    }, 0);
  } else if (apiProduct.stock && typeof apiProduct.stock === 'object') {
    const stockData = apiProduct.stock as { total_quantity?: number; available?: number; quantity?: number; in_stock?: boolean };
    stockQuantity = stockData?.total_quantity ?? stockData?.available ?? stockData?.quantity ?? 0;
  }

  // Handle brand data from ProductDetail
  const brandData = 'brand' in apiProduct ? (apiProduct as ProductDetail).brand : undefined;

  // Extract dimensions
  let dimensions: ProductDimensions | undefined = undefined;
  if ('weights' in apiProduct && Array.isArray(apiProduct.weights) && apiProduct.weights.length > 0) {
    const w = apiProduct.weights[0] as any;
    dimensions = {
      weight: w.weight ? String(w.weight) : undefined,
      length: w.length ? String(w.length) : undefined,
      width: w.width ? String(w.width) : undefined,
      height: w.height ? String(w.height) : undefined,
    };
  }

  // Create a map of variant stock if stock is an array at product level
  const variantStockMap = new Map<number, number>();
  if (Array.isArray(apiProduct.stock)) {
    apiProduct.stock.forEach((s: any) => {
      if (s.variant_id) {
        variantStockMap.set(s.variant_id, s.quantity || 0);
      }
    });
  }

  // Extract attributes
  let attributes: ProductAttribute[] | undefined = undefined;
  const attributeIdToName = new Map<number, string>();

  if ('attributes' in apiProduct && Array.isArray(apiProduct.attributes)) {
    attributes = (apiProduct.attributes as any[])
      .sort((a, b) => (a.attribute?.sort_order ?? 0) - (b.attribute?.sort_order ?? 0))
      .map(attr => {
      const attrName = getLocalizedText(attr.attribute?.name_en, attr.attribute?.name_ar, locale);
      attributeIdToName.set(attr.attribute_id, attrName);
      
      const valuesMap = new Map<string, { meta?: string, image?: string, sortOrder: number }>();
      
      if ('variants' in apiProduct && Array.isArray(apiProduct.variants)) {
        (apiProduct.variants as any[]).forEach(v => {
          if (v.combinations && Array.isArray(v.combinations)) {
            v.combinations.forEach((c: any) => {
              if (c.attribute_value?.attribute_id === attr.attribute_id) {
                const val = getLocalizedText(c.attribute_value.value_en, c.attribute_value.value_ar, locale);
                // Use image_url if available (for media control), otherwise color_code
                // If controls_media is true, we prioritize image_url from the attribute value if it exists
                // But wait, the attribute value itself might not have the image url directly if it's just a "Color" value definition.
                // The image is usually in the product media gallery, linked to the attribute value.
                
                // Let's check if we can find media linked to this attribute value in the product media
                let mediaUrl = c.attribute_value.image_url;
                
                if (!mediaUrl && 'media' in apiProduct && Array.isArray(apiProduct.media)) {
                   // Find media that belongs to this attribute value
                   const matchingMedia = (apiProduct.media as any[]).find(m => 
                     m.media_group?.groupValues?.some((gv: any) => 
                       gv.attribute_id === attr.attribute_id && gv.attribute_value_id === c.attribute_value_id
                     )
                   );
                   if (matchingMedia) {
                     mediaUrl = matchingMedia.url;
                   }
                }
                
                const meta = c.attribute_value.color_code;
                const sortOrder = c.attribute_value.sort_order ?? 0;
                valuesMap.set(val, { meta, image: mediaUrl, sortOrder });
              }
            });
          }
        });
      }
      
      return {
        id: String(attr.attribute_id),
        name: attrName,
        values: Array.from(valuesMap.entries())
          .sort(([, a], [, b]) => a.sortOrder - b.sortOrder)
          .map(([value, data]) => ({ 
          value, 
          meta: data.meta,
          image: data.image
        })),
        isColor: attr.attribute?.is_color || false,
        controlsPricing: attr.controls_pricing || false,
        controlsMedia: attr.controls_media || false,
        controlsWeight: attr.controls_weight || false
      };
    }).filter(a => a.values.length > 0);
  }

  return {
    id: String(apiProduct.id),
    name: getLocalizedText(apiProduct.name_en, apiProduct.name_ar, locale) || 'Unnamed Product',
    nameAr: apiProduct.name_ar,
    slug: generateSlug(apiProduct.name_en) + '-' + apiProduct.id,
    description: getLocalizedText(apiProduct.short_description_en, apiProduct.short_description_ar, locale),
    descriptionAr: apiProduct.short_description_ar || undefined,
    longDescription: getLocalizedText(apiProduct.long_description_en, apiProduct.long_description_ar, locale) || undefined,
    attributes,
    dimensions,
    price: actualPrice,
    compareAtPrice: compareAtPrice,
    images,
    category: (() => {
      // Check if categories array exists and has items
      if ('categories' in apiProduct && apiProduct.categories && Array.isArray(apiProduct.categories) && apiProduct.categories.length > 0) {
        const cat = apiProduct.categories[0];
        return {
          id: String(cat.id),
          name: getLocalizedText(cat.name_en, cat.name_ar, locale) || 'Category',
          nameAr: cat.name_ar,
          slug: generateSlug(cat.name_en) + '-' + cat.id,
        };
      }
      // Fallback to category object if it exists
      if (apiProduct.category) {
        return {
          id: String(apiProduct.category.id),
          name: getLocalizedText(apiProduct.category.name_en, apiProduct.category.name_ar, locale) || 'Category',
          nameAr: apiProduct.category.name_ar,
          slug: generateSlug(apiProduct.category.name_en) + '-' + apiProduct.category.id,
        };
      }
      // Default fallback
      return {
        id: '0',
        name: locale === 'ar' ? 'غير مصنف' : 'Uncategorized',
        slug: 'uncategorized',
      };
    })(),
    brand: brandData ? {
      id: String(brandData.id),
      name: getLocalizedText(brandData.name_en, brandData.name_ar, locale) || 'Brand',
      slug: generateSlug(brandData.name_en),
      logo: brandData.logo || undefined,
    } : undefined,
    vendor: apiProduct.vendor ? {
      id: String(apiProduct.vendor.id),
      name: getLocalizedText(apiProduct.vendor.name_en, (apiProduct.vendor as { name_ar?: string }).name_ar, locale) || 'Vendor',
      slug: generateSlug(apiProduct.vendor.name_en),
      logo: (apiProduct.vendor as { logo?: string }).logo || undefined,
      description: getLocalizedText((apiProduct.vendor as any).description_en, (apiProduct.vendor as any).description_ar, locale),
      rating: 0,
      reviewCount: 0,
    } : undefined,
    tags: [],
    variants: 'variants' in apiProduct && apiProduct.variants 
      ? apiProduct.variants.map(v => {
          const variantAttributes: Record<string, string> = {};
          if (v.combinations && Array.isArray(v.combinations)) {
            v.combinations.forEach((c: any) => {
              const attrId = c.attribute_value?.attribute_id;
              const attrName = attributeIdToName.get(attrId);
              if (attrName) {
                variantAttributes[attrName] = getLocalizedText(c.attribute_value.value_en, c.attribute_value.value_ar, locale);
              }
            });
          }
          const priceData = getVariantPriceData(v);
          return {
            id: String(v.id),
            name: getLocalizedText(v.name_en, v.name_ar, locale) || '',
            price: priceData.actual,
            compareAtPrice: priceData.compare,
            stock: variantStockMap.get(v.id) ?? (v.stock?.[0]?.quantity ?? v.stock?.[0]?.available ?? 0),
            sku: v.sku || '',
            attributes: variantAttributes,
          };
        })
      : undefined,
    stock: stockQuantity,
    sku: apiProduct.sku,
    rating: typeof apiProduct.average_rating === 'string' ? parseFloat(apiProduct.average_rating) : apiProduct.average_rating,
    reviewCount: apiProduct.total_ratings,
    isFeatured: false,
    isNew: isNewProduct(apiProduct.created_at),
    createdAt: apiProduct.created_at,
    updatedAt: apiProduct.updated_at,
  };
}

/**
 * Transform API Category to Frontend Category
 */
export function transformCategory(apiCategory: ApiCategory | CategoryDetail, locale: Locale = 'en'): FrontendCategory {
  return {
    id: String(apiCategory.id),
    name: getLocalizedText(apiCategory.name_en, apiCategory.name_ar, locale),
    nameAr: apiCategory.name_ar,
    slug: generateSlug(apiCategory.name_en) + '-' + apiCategory.id,
    description: getLocalizedText(apiCategory.description_en, apiCategory.description_ar, locale) || undefined,
    image: apiCategory.image || undefined,
    parentId: apiCategory.parent_id ? String(apiCategory.parent_id) : undefined,
    children: apiCategory.children?.map(child => ({
      id: String(child.id),
      name: getLocalizedText(child.name_en, child.name_ar, locale),
      nameAr: child.name_ar,
      slug: generateSlug(child.name_en) + '-' + child.id,
    })),
    productCount: 'products' in apiCategory ? apiCategory.products?.length : undefined,
  };
}

/**
 * Transform API Vendor to Frontend Vendor
 */
export function transformVendor(apiVendor: ApiVendor, locale: Locale = 'en'): FrontendVendor {
  return {
    id: String(apiVendor.id),
    name: getLocalizedText(apiVendor.name_en, apiVendor.name_ar, locale),
    slug: generateSlug(apiVendor.name_en) + '-' + apiVendor.id,
    logo: apiVendor.logo || undefined,
    rating: 0, // Not in API response
    reviewCount: 0, // Not in API response
  };
}

/**
 * Check if a product is new (created within last 30 days)
 */
function isNewProduct(createdAt: string): boolean {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return new Date(createdAt) > thirtyDaysAgo;
}

/**
 * Transform array of products
 */
export function transformProducts(apiProducts: ApiProduct[], locale: Locale = 'en'): FrontendProduct[] {
  return apiProducts.map(p => transformProduct(p, locale));
}

/**
 * Transform array of categories
 */
export function transformCategories(apiCategories: ApiCategory[], locale: Locale = 'en'): FrontendCategory[] {
  return apiCategories.map(c => transformCategory(c, locale));
}

/**
 * Transform array of vendors
 */
export function transformVendors(apiVendors: ApiVendor[], locale: Locale = 'en'): FrontendVendor[] {
  return apiVendors.map(v => transformVendor(v, locale));
}

/**
 * Transform API Banner to Frontend Banner
 */
export function transformBanner(apiBanner: ApiBanner | HomeBanner, locale: Locale = 'en'): FrontendBanner {
  const titleEn = 'title_en' in apiBanner ? apiBanner.title_en : undefined;
  const titleAr = 'title_ar' in apiBanner ? apiBanner.title_ar : undefined;
  const descEn = 'description_en' in apiBanner ? apiBanner.description_en : undefined;
  const descAr = 'description_ar' in apiBanner ? apiBanner.description_ar : undefined;
  
  return {
    id: String(apiBanner.id),
    title: getLocalizedText(titleEn, titleAr, locale),
    subtitle: getLocalizedText(descEn, descAr, locale) || undefined,
    image: apiBanner.image,
    link: apiBanner.link || '#',
    buttonText: locale === 'ar' ? 'تسوق الآن' : 'Shop Now',
    isActive: 'status' in apiBanner ? apiBanner.status === 'active' : true,
    order: apiBanner.sort_order,
  };
}

/**
 * Transform array of banners
 */
export function transformBanners(apiBanners: (ApiBanner | HomeBanner)[], locale: Locale = 'en'): FrontendBanner[] {
  return apiBanners.map(b => transformBanner(b, locale));
}

/**
 * Transform Home Category (from /api/home) to Frontend Category
 */
export function transformHomeCategory(homeCategory: HomeCategory, locale: Locale = 'en'): FrontendCategory {
  return {
    id: String(homeCategory.id),
    name: getLocalizedText(homeCategory.name_en, homeCategory.name_ar, locale),
    nameAr: homeCategory.name_ar,
    slug: generateSlug(homeCategory.name_en) + '-' + homeCategory.id,
    image: homeCategory.image || undefined,
  };
}

/**
 * Transform Home Vendor (from /api/home) to Frontend Vendor
 */
export function transformHomeVendor(homeVendor: HomeVendor, locale: Locale = 'en'): FrontendVendor {
  return {
    id: String(homeVendor.id),
    name: getLocalizedText(homeVendor.name_en, homeVendor.name_ar, locale),
    slug: generateSlug(homeVendor.name_en) + '-' + homeVendor.id,
    logo: homeVendor.logo || undefined,
    rating: 0,
    reviewCount: 0,
  };
}

/**
 * Transform Home Brand (from /api/home) to Frontend Brand
 */
export function transformHomeBrand(homeBrand: HomeBrand, locale: Locale = 'en'): FrontendBrand {
  return {
    id: String(homeBrand.id),
    name: getLocalizedText(homeBrand.name_en, homeBrand.name_ar, locale),
    slug: generateSlug(homeBrand.name_en) + '-' + homeBrand.id,
    logo: homeBrand.logo || undefined,
  };
}

/**
 * Transform Home Data (from /api/home) to frontend types
 */
export function transformHomeData(homeData: HomeData, locale: Locale = 'en'): {
  categories: FrontendCategory[];
  vendors: FrontendVendor[];
  banners: FrontendBanner[];
  brands: FrontendBrand[];
} {
  // Filter banners by language and sort by sort_order
  const filteredBanners = (homeData?.banners ?? [])
    .filter(b => b.language === locale)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(b => transformBanner(b, locale));

  return {
    categories: (homeData?.categories ?? []).map(c => transformHomeCategory(c, locale)),
    vendors: (homeData?.vendors ?? []).map(v => transformHomeVendor(v, locale)),
    banners: filteredBanners,
    brands: (homeData?.brands ?? []).map(b => transformHomeBrand(b, locale)),
  };
}
