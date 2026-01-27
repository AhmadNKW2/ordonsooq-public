"use client";

import { useMemo } from "react";
import { notFound } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { transformCategory, type Locale } from "@/lib/transformers";
import { EntityHeader } from "@/components/ui/entity-header";
import { ProductListingPage } from "@/components/products/product-listing-page";
import { ProductReviews } from "@/components/products/product-reviews";
import { ListingLayout } from "@/components/layout/listing-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { EntityCarousel, type EntityCarouselItem } from "@/components/home/entity-carousel";
import { Star, MapPin, Phone, Mail } from "lucide-react";

interface EntityListingPageProps {
  type: 'brand' | 'category' | 'vendor' | 'shop';
  slug?: string;
  data?: any;
  isLoading?: boolean;
  error?: any;
}

export function EntityListingPage({ type, slug = "", data, isLoading = false, error }: EntityListingPageProps) {
  const locale = useLocale() as Locale;
  const isAr = locale === 'ar';
  const t = useTranslations();
  
  // Get ID from data if available, otherwise fallback to parsing from slug (legacy)
  const id = useMemo(() => {
    if (data?.id) return data.id;
    return parseInt(slug.split('-').pop() || '0', 10);
  }, [slug, data]);

  // Determine entity type flags
  const isBrand = type === 'brand';
  const isCategory = type === 'category';
  const isVendor = type === 'vendor';
  const isShop = type === 'shop';

  // --- Category Specific Logic ---
  const transformedCategory = useMemo(() => {
    if (isCategory && data) {
      return transformCategory(data, locale);
    }
    return null;
  }, [isCategory, data, locale]);

  const subcategories = transformedCategory?.children || [];
  
  const subCategoryItems: EntityCarouselItem[] = useMemo(() => {
    return subcategories.map((sub: any) => ({
      id: sub.id,
      href: `/categories/${sub.slug}`,
      name: sub.name,
      image: sub.image,
      isCategory: true,
    }));
  }, [subcategories]);

  const preloadedProducts = useMemo(() => {
     if (isCategory && data && 'products' in data) {
         return data.products as any[];
     }
     return undefined;
  }, [isCategory, data]);

  const preloadedBrands = useMemo(() => {
    if (!preloadedProducts) return undefined;
    const brandsMap = new Map();
    preloadedProducts.forEach((p: any) => {
      if (p.brand && typeof p.brand === 'object' && 'id' in p.brand) {
        brandsMap.set(p.brand.id, p.brand);
      }
    });
    return Array.from(brandsMap.values());
  }, [preloadedProducts]);

  // --- Data Normalization for View ---
  const viewData = useMemo(() => {
      if (!data && !isShop) return null;
      
      let title = "";
      let description = "";
      let image = "";
      
      if (isCategory && transformedCategory) {
          title = transformedCategory.name || "";
          description = transformedCategory.description || "";
          image = transformedCategory.image || "";
      } else if (isBrand || isVendor) {
          const name = isAr ? data.name_ar : data.name_en;
          const desc = isAr ? data.description_ar : data.description_en;
          title = name || "";
          description = desc || "";
          image = data.logo || "";
      } else if (isShop) {
          title = t('product.allProductsTitle');
          description = t('product.allProductsSubtitle');
          image = ""; // Or some default shop banner
      }
      
      return { title, description, image };
  }, [data, isCategory, transformedCategory, isBrand, isVendor, isShop, isAr, t]);

  // --- Loading State ---
  if (isLoading) {
    // Determine title for skeleton breadcrumb
    const rootTitle = isBrand ? t("nav.brands") : isCategory ? t("nav.categories") : isShop ? t("nav.products") : t("nav.stores");
    
    return (
      <ListingLayout
        title={<Skeleton className="h-10 w-64" />}
        breadcrumbs={[
          { label: t("common.home"), href: "/" },
          { label: rootTitle, href: "#" }, // Simplify href for skeleton
          { label: "...", href: "#" },
        ]}
      >
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Skeleton className="h-screen w-full md:col-span-1" />
            <Skeleton className="h-screen w-full md:col-span-3" />
          </div>
        </div>
      </ListingLayout>
    );
  }

  // --- Error/Not Found State ---
  if (error || (!isShop && !data) || (isCategory && !transformedCategory)) {
    notFound();
  }

  if (!viewData) return null; // Should be handled above

  // --- Breadcrumbs ---
  let rootPath = "";
  let rootLabel = "";
  if (isBrand) { rootPath = "/brands"; rootLabel = t("nav.brands"); }
  else if (isCategory) { rootPath = "/categories"; rootLabel = t("nav.categories"); }
  else if (isVendor) { rootPath = "/vendors"; rootLabel = t("nav.stores"); }
  else if (isShop) { rootPath = "/products"; rootLabel = t("nav.products"); }

  // --- Vendor Details ---
  // Mock data as in original file
  const rating = 4.8;
  const reviewCount = 120;

  const headerContent = !isShop ? (
    <EntityHeader
      title={viewData.title}
      image={viewData.image}
      description={viewData.description}
    >
      {isVendor && (
        <div className="flex flex-col">
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-secondary/10 border border-secondary/25 px-2 py-1 rounded-md text-secondary">
                    <Star className="fill-current w-4 h-4" />
                    <span className="font-bold">{rating}</span>
                </div>
                <span className="text-gray-400 text-sm">
                    ({reviewCount} {t("common.reviews")})
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.address && (
                    <div className="flex items-center gap-2 text-gray-600">
                        <MapPin size={18} className="text-primary" />
                        <span>{data.address}</span>
                    </div>
                )}
                {data.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                        <Phone size={18} className="text-primary" />
                        <span className="dir-ltr">{data.phone}</span>
                    </div>
                )}
                {data.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                        <Mail size={18} className="text-primary" />
                        <span>{data.email}</span>
                    </div>
                )}
            </div>
        </div>
      )}
    </EntityHeader>
  ) : undefined;

  const initialFilters = isBrand 
    ? { brandId: id } 
    : isCategory 
      ? { categoryId: id } 
      : isVendor
        ? { vendorId: id }
        : {};

  const breadcrumbs = [
    { label: t("common.home"), href: "/" },
  ];

  if (isShop) {
    breadcrumbs.push({ label: rootLabel, href: rootPath });
  } else {
    breadcrumbs.push({ label: rootLabel, href: rootPath });
    breadcrumbs.push({ label: viewData.title, href: `${rootPath}/${slug}` });
  }

  return (
    <ListingLayout
      heroContent={headerContent}
      title={isShop ? viewData.title : undefined}
      subtitle={isShop ? viewData.description : undefined}
      breadcrumbs={breadcrumbs}
    >
      {isCategory && subcategories.length > 0 && (
        <EntityCarousel
          title=""
          items={subCategoryItems}
          viewAllHref=""
          showViewAll={false}
          layoutVariant="compact"
        />
      )}

      <ProductListingPage
        initialFilters={initialFilters}
        title={isShop ? undefined : t("common.products")}
        availableCategories={isCategory ? subcategories : undefined}
        preloadedProducts={isCategory ? preloadedProducts : undefined}
        preloadedBrands={isCategory ? preloadedBrands : undefined}
      />
      
      {isVendor && (
         <ProductReviews
            rating={rating}
            reviewCount={reviewCount}
            reviews={[]} // Empty array as in original
         />
      )}
    </ListingLayout>
  );
}
