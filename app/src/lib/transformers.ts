/**
 * Transforms API data to frontend types
 * This bridges the gap between backend API responses and frontend UI components
 */

import type { Product as FrontendProduct, Category as FrontendCategory, Vendor as FrontendVendor, Banner as FrontendBanner, Brand as FrontendBrand, ProductDimensions, ProductAttribute, ProductAttributeValue } from '@/types';
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
  const product = apiProduct as ApiProduct;

  // 1. Images
  let images: string[] = [];
  const mediaGroups = product.media_groups ? Object.values(product.media_groups) : [];
  
  // Sort media groups: group with is_primary image first
  mediaGroups.sort((a, b) => {
    const aHasPrimary = a.media?.some(m => m.is_primary);
    const bHasPrimary = b.media?.some(m => m.is_primary);
    if (aHasPrimary && !bHasPrimary) return -1;
    if (!aHasPrimary && bHasPrimary) return 1;
    return 0;
  });

  mediaGroups.forEach(group => {
     if (Array.isArray(group.media)) {
        // Sort within group: is_group_primary first
        const sortedMedia = [...group.media].sort((a, b) => {
           if (a.is_group_primary && !b.is_group_primary) return -1;
           if (!a.is_group_primary && b.is_group_primary) return 1;
           return 0;
        });

        sortedMedia.forEach(m => {
           if (m.url && !images.includes(m.url)) {
              images.push(m.url);
           }
        });
     }
  });

  // Fallback to placeholder
  if (images.length === 0) {
     images = ['/placeholder.svg'];
  }

  // 2. Price
  // Calculate default price range or start price from price_groups
  let actualPrice = 0;
  let compareAtPrice: number | undefined = undefined;
  
  // Collect all prices from groups
  const prices: { price: number, sale_price?: number }[] = [];
  if (product.price_groups) {
    Object.values(product.price_groups).forEach(pg => {
       const p = parseFloat(String(pg.price));
       const s = pg.sale_price ? parseFloat(String(pg.sale_price)) : undefined;
       prices.push({ price: p, sale_price: s });
    });
  }

  if (prices.length > 0) {
      // Use the lowest price for display
      const lowestPrice = prices.sort((a, b) => {
         const priceA = a.sale_price ?? a.price;
         const priceB = b.sale_price ?? b.price;
         return priceA - priceB;
      })[0];
      
      actualPrice = lowestPrice.sale_price ?? lowestPrice.price;
      compareAtPrice = lowestPrice.sale_price ? lowestPrice.price : undefined;
  }

  // 3. Attributes
  const attributes: ProductAttribute[] = [];
  const attributeIdToName = new Map<number, string>();
  const attributeIdToValuesMap = new Map<number, Map<number, string>>(); 

  if (product.attributes) {
    Object.entries(product.attributes).forEach(([key, attrGroup]) => {
       const attrId = parseInt(key);
       const attrName = getLocalizedText(attrGroup.name_en, attrGroup.name_ar, locale);
       attributeIdToName.set(attrId, attrName);

       const values: ProductAttributeValue[] = [];
       const valuesMap = new Map<number, string>();

       if (attrGroup.values) {
         Object.entries(attrGroup.values).forEach(([valKey, valData]) => {
             const valId = parseInt(valKey);
             const valName = getLocalizedText(valData.name_en, valData.name_ar, locale);
             valuesMap.set(valId, valName);
             
             values.push({
               value: valName,
               meta: valData.color_code ?? undefined
             });
         });
       }

       attributeIdToValuesMap.set(attrId, valuesMap);

       attributes.push({
         id: key,
         name: attrName,
         values: values,
         isColor: attrName.toLowerCase().includes('color') || attrName.includes('اللون') || Object.values(attrGroup.values || {}).some(v => !!v.color_code),
         controlsPricing: false, 
         controlsMedia: false, 
         controlsWeight: false
       });
    });
  }
  
  // 4. Stock
  let stock = 0;
  if (product.variants && product.variants.length > 0) {
      stock = product.variants.reduce((acc, v) => acc + (v.quantity || 0), 0);
  } else {
      stock = product.quantity || 0;
  }

  // 5. Variants
  const variants = product.variants?.map(v => {
     // Resolve attributes
     const variantAttributes: Record<string, string> = {};
     if (v.attribute_values) {
        Object.entries(v.attribute_values).forEach(([attrIdStr, valId]) => {
           const attrId = parseInt(attrIdStr);
           const pValId = typeof valId === 'number' ? valId : parseInt(valId as any);
           const valName = attributeIdToValuesMap.get(attrId)?.get(pValId);
           const attrName = attributeIdToName.get(attrId);
           if (attrName && valName) {
              variantAttributes[attrName] = valName;
           }
        });
     }

     // Resolve Price
     let vPrice = 0;
     let vComparePrice: number | undefined = undefined;
     if (product.price_groups && v.price_group_id && product.price_groups[v.price_group_id]) {
        const pg = product.price_groups[v.price_group_id];
        const p = parseFloat(String(pg.price));
        const s = pg.sale_price ? parseFloat(String(pg.sale_price)) : undefined;
        vPrice = s ?? p;
        vComparePrice = s ? p : undefined;
     }

     // Resolve Image
     let vImage: string | undefined = undefined;
     if (product.media_groups && v.media_group_id && product.media_groups[v.media_group_id]) {
        const mg = product.media_groups[v.media_group_id];
        if (mg.media) {
            const groupPrimary = mg.media.find(m => m.is_group_primary);
            if (groupPrimary) vImage = groupPrimary.url;
        }
     }

     // Resolve Dimensions
     let vDimensions: ProductDimensions | undefined = undefined;
     if (product.weight_groups && v.weight_group_id && product.weight_groups[v.weight_group_id]) {
         const wg = product.weight_groups[v.weight_group_id];
         vDimensions = {
             weight: String(wg.weight),
             length: String(wg.dimensions?.length),
             width: String(wg.dimensions?.width),
             height: String(wg.dimensions?.height),
         };
     }

     return {
         id: String(v.id),
         name: getLocalizedText(product.name_en, product.name_ar, locale),
         price: vPrice,
         compareAtPrice: vComparePrice,
         stock: v.quantity,
         sku: product.sku + '-' + v.id,
         attributes: variantAttributes,
         image: vImage,
         dimensions: vDimensions
     } as any;
  }) || [];

  return {
    id: String(product.id),
    name: getLocalizedText(product.name_en, product.name_ar, locale),
    nameAr: product.name_ar,
    slug: product.slug || generateSlug(product.name_en),
    description: getLocalizedText(product.short_description_en, product.short_description_ar, locale),
    descriptionAr: product.short_description_ar || undefined, // short_description_ar is string|null
    longDescription: getLocalizedText(product.long_description_en, product.long_description_ar, locale),
    price: actualPrice,
    compareAtPrice: compareAtPrice,
    images: images,
    category: {
      id: String(product.categories?.[0]?.id ?? ''),
      name: getLocalizedText(product.categories?.[0]?.name_en, product.categories?.[0]?.name_ar, locale),
      nameAr: product.categories?.[0]?.name_ar,
      slug: generateSlug(product.categories?.[0]?.name_en),
      description: product.categories?.[0]?.description_en ? getLocalizedText(product.categories[0].description_en, product.categories[0].description_ar, locale) : undefined,
      image: product.categories?.[0]?.image || undefined,
      children: [], // Add required properties
      // ProductCount is not typically in product category object
    } as any, // Cast because Category type might expect fields not present in this minimal mapping if type is strict
    brand: product.brand ? {
      id: String(product.brand.id),
      name: getLocalizedText(product.brand.name_en, product.brand.name_ar, locale),
      slug: generateSlug(product.brand.name_en),
      logo: product.brand.logo || undefined
    } : undefined,
    vendor: product.vendor ? {
      id: String(product.vendor.id),
      name: getLocalizedText(product.vendor.name_en, product.vendor.name_ar, locale),
      slug: generateSlug(product.vendor.name_en),
      description: getLocalizedText(product.vendor.description_en, product.vendor.description_ar, locale),
      logo: product.vendor.logo || undefined,
      rating: typeof product.vendor.rating === 'string' ? parseFloat(product.vendor.rating) : (product.vendor.rating || 0),
      reviewCount: product.vendor.rating_count || 0
    } : undefined,
    tags: [],
    variants: variants,
    hasVariants: variants.length > 0,
    attributes: attributes,
    dimensions: (() => {
        if (product.weight_groups) {
            const firstWg = Object.values(product.weight_groups)[0];
             if (firstWg) {
                 return {
                    weight: String(firstWg.weight),
                    length: String(firstWg.dimensions?.length),
                    width: String(firstWg.dimensions?.width),
                    height: String(firstWg.dimensions?.height),
                 };
             }
        }
        return undefined;
    })(),
    stock: stock,
    sku: product.sku,
    rating: parseFloat(String(product.average_rating)),
    reviewCount: product.total_ratings,
    isFeatured: false,
    isNew: isNewProduct(product.created_at),
    createdAt: product.created_at,
    updatedAt: product.updated_at
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
      image: child.image || undefined,
    })),
    productCount: 'products' in apiCategory ? apiCategory.products?.length : undefined,
    products: 'products' in apiCategory && apiCategory.products 
      ? transformProducts(apiCategory.products as any[], locale)
      : undefined
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
 * Transform products for listing grids.
 *
 * If a product has `variantIds` (from list responses like `variants_ids`), expand it into one
 * item per variant so it can appear as multiple cards. Each expanded card sets `defaultVariantId`
 * which is used to deep-link to the product page with `?variant=<id>`.
 */
export function transformProductsForListing(apiProducts: ApiProduct[], locale: Locale = 'en'): FrontendProduct[] {
  const base = transformProducts(apiProducts, locale);

  return base.flatMap((p) => {
    const ids = Array.isArray(p.variantIds) ? p.variantIds : [];
    if (ids.length === 0) return [p];

    return ids.map((id) => ({
      ...p,
      hasVariants: true,
      defaultVariantId: String(id),
    }));
  });
}

/**
 * Transform array of categories
 */
export function transformCategories(apiCategories: ApiCategory[], locale: Locale = 'en'): FrontendCategory[] {
  return apiCategories.map(c => transformCategory(c, locale));
}

/**
 * Transform API brand to frontend brand
 */
export function transformBrand(apiBrand: HomeBrand | any, locale: Locale = 'en'): FrontendBrand {
  const name = getLocalizedText(apiBrand.name_en, apiBrand.name_ar, locale);
  return {
    id: String(apiBrand.id),
    name,
    slug: apiBrand.slug || `brand-${generateSlug(name)}-${apiBrand.id}`,
    logo: apiBrand.logo || undefined,
    description: getLocalizedText(apiBrand.description_en, apiBrand.description_ar, locale),
  };
}

/**
 * Transform a list of API brands to frontend brands
 */
export function transformBrands(apiBrands: any[], locale: Locale = 'en'): FrontendBrand[] {
  return apiBrands.map(brand => transformBrand(brand, locale));
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
