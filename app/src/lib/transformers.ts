/**
 * Transforms API data to frontend types
 * This bridges the gap between backend API responses and frontend UI components
 */

import type { Product as FrontendProduct, Category as FrontendCategory, Vendor as FrontendVendor, Banner as FrontendBanner, Brand as FrontendBrand } from '@/types';
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

  // Get price from prices array or direct property
  const priceData = apiProduct.prices?.[0];
  const regularPrice = priceData?.price ? parseFloat(String(priceData.price)) : 
    (apiProduct as { price?: string }).price ? parseFloat((apiProduct as { price?: string }).price!) : 0;
  
  // Get sale price if available - from direct field only (not in prices array)
  const salePrice = (apiProduct as { sale_price?: string }).sale_price ? 
    parseFloat((apiProduct as { sale_price?: string }).sale_price!) : undefined;
  
  // Determine actual price and compareAtPrice
  const actualPrice = salePrice && salePrice < regularPrice ? salePrice : regularPrice;
  const compareAtPrice = salePrice && salePrice < regularPrice ? regularPrice : undefined;

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

  return {
    id: String(apiProduct.id),
    name: getLocalizedText(apiProduct.name_en, apiProduct.name_ar, locale) || 'Unnamed Product',
    nameAr: apiProduct.name_ar,
    slug: generateSlug(apiProduct.name_en) + '-' + apiProduct.id,
    description: getLocalizedText(apiProduct.short_description_en, apiProduct.short_description_ar, locale),
    descriptionAr: apiProduct.short_description_ar || undefined,
    longDescription: getLocalizedText(apiProduct.long_description_en, apiProduct.long_description_ar, locale) || undefined,
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
      rating: 0,
      reviewCount: 0,
    } : undefined,
    tags: [],
    variants: 'variants' in apiProduct && apiProduct.variants 
      ? apiProduct.variants.map(v => ({
          id: String(v.id),
          name: getLocalizedText(v.name_en, v.name_ar, locale) || '',
          price: v.prices?.[0]?.price ? parseFloat(String(v.prices[0].price)) : actualPrice,
          stock: v.stock?.[0]?.available ?? 0,
          sku: v.sku || '',
          attributes: {},
        }))
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
  return {
    categories: (homeData?.categories ?? []).map(c => transformHomeCategory(c, locale)),
    vendors: (homeData?.vendors ?? []).map(v => transformHomeVendor(v, locale)),
    banners: (homeData?.banners ?? []).map(b => transformBanner(b, locale)),
    brands: (homeData?.brands ?? []).map(b => transformHomeBrand(b, locale)),
  };
}
