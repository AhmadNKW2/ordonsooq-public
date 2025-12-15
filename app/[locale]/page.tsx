"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  HeroBanner,
  ShopBySection,
  FeaturedProducts,
  FeaturesSection,
  Newsletter,
} from "@/components/home";
import { useProducts, useHome } from "@/hooks";
import { transformProducts, transformHomeData, type Locale } from "@/lib/transformers";
import { ProductGridSkeleton, CategoryCardSkeleton, Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Store, Tag } from "lucide-react";

export default function HomePage() {
  const locale = useLocale() as Locale;
  const t = useTranslations('home');

  // Fetch home data (categories, vendors, banners)
  const { 
    data: homeData, 
    isLoading: homeLoading,
    error: homeError 
  } = useHome();

  // Fetch featured products (visible and in stock)
  const { 
    data: featuredData, 
    isLoading: featuredLoading,
    error: featuredError 
  } = useProducts({ 
    limit: 8, 
    status: 'active',
    visible: true,
    sortBy: 'average_rating',
    sortOrder: 'DESC'
  });

  // Fetch new products (visible and in stock)
  const { 
    data: newData, 
    isLoading: newLoading,
    error: newError 
  } = useProducts({ 
    limit: 8, 
    status: 'active',
    visible: true,
    sortBy: 'created_at',
    sortOrder: 'DESC'
  });

  // Transform home data (categories, vendors, banners) with locale
  const { categories, vendors, banners, brands } = homeData 
    ? transformHomeData(homeData, locale) 
    : { categories: [], vendors: [], banners: [], brands: [] };

  // Transform and filter out of stock products with locale
  const featuredProducts = featuredData?.data
    ? transformProducts(featuredData.data, locale).filter(p => p.stock > 0) 
    : [];
  const newProducts = newData?.data
    ? transformProducts(newData.data, locale).filter(p => p.stock > 0) 
    : [];

  return (
    <div className="flex flex-col gap-10 py-10">
      {/* Hero Banner */}
      <section className="container mx-auto pt-0">
        {homeLoading ? (
          <Skeleton className="h-[400px] md:h-[500px] rounded-2xl" />
        ) : (
          <HeroBanner banners={banners} />
        )}
      </section>

      {/* Categories Carousel */}
      <section className="container mx-auto px-4">
        {homeLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <ShopBySection
            title={t('shopByCategory')}
            subtitle={<span className="text-secondary">{t('exploreCategories')}</span>}
            items={categories}
            viewAllHref="/categories"
            arrowBackgroundColor="black/20"
            fadeClassName="bg-linear-to-r from-white to-transparent"
            fadePositionClassName="top-0 bottom-4"
            renderItem={(category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group/category flex flex-col items-center shrink-0"
              >
                <div className="relative w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden border-4 border-white shadow-s1 group-hover/category:shadow-s1 group-hover/category:border-primary/20 transition-all duration-300 group-hover/category:scale-105">
                  {category.image ? (
                    <Image src={category.image} alt={category.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <span className="text-3xl font-bold text-primary">{category.name.charAt(0)}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover/category:opacity-100 transition-opacity duration-300" />
                </div>

                <h3 className="mt-4 text-sm md:text-base font-medium text-gray-700 group-hover/category:text-primary transition-colors text-center max-w-[140px] line-clamp-2">
                  {category.name}
                </h3>

                {category.productCount !== undefined && (
                  <p className="text-xs text-gray-400 mt-1">{category.productCount} items</p>
                )}
              </Link>
            )}
          />
        )}
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4">
        {featuredLoading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <FeaturedProducts
            products={featuredProducts}
            title={t('featuredProducts')}
            subtitle={t('featuredSubtitle')}
          />
        )}
      </section>

      {/* Features Section */}
      <section className="container mx-auto">
        <FeaturesSection />
      </section>

      {/* Brands Section */}
      <section className="container mx-auto px-4">
        {homeLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-r1" />
            ))}
          </div>
        ) : (
          <ShopBySection
            title={t('shopByBrand')}
            subtitle={t('trustedBrands')}
            items={brands}
            viewAllHref="/brands"
            renderItem={(brand) => (
              <Link
                key={brand.id}
                href={`/brands/${brand.slug}`}
                className="group/brand flex flex-col items-center shrink-0"
              >
                <div className="relative w-32 h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-r1 overflow-hidden bg-white border border-gray-100 shadow-s1 group-hover/brand:shadow-s1 group-hover/brand:border-primary/20 transition-all duration-300 group-hover/brand:scale-105 flex items-center justify-center p-4">
                  {brand.logo ? (
                    <Image src={brand.logo} alt={brand.name} fill className="object-contain p-4" />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-primary/10 to-secondary/10 flex items-center justify-center rounded-lg">
                      <Tag className="w-12 h-12 text-primary/60" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover/brand:opacity-100 transition-opacity duration-300" />
                </div>

                <h3 className="mt-3 text-sm md:text-base font-medium text-gray-700 group-hover/brand:text-primary transition-colors text-center max-w-[140px] line-clamp-2">
                  {brand.name}
                </h3>
              </Link>
            )}
          />
        )}
      </section>

      {/* Vendors Section */}
      <section className="container mx-auto px-4">
        {homeLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-r1" />
            ))}
          </div>
        ) : (
          <ShopBySection
            title={t('shopByVendor')}
            subtitle={t('trustedVendors')}
            items={vendors}
            viewAllHref="/vendors"
            renderItem={(vendor) => (
              <Link
                key={vendor.id}
                href={`/vendors/${vendor.slug}`}
                className="group/vendor flex flex-col items-center shrink-0"
              >
                <div className="relative w-32 h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-r1 overflow-hidden bg-white border border-gray-100 shadow-s1 group-hover/vendor:shadow-s1 group-hover/vendor:border-primary/20 transition-all duration-300 group-hover/vendor:scale-105 flex items-center justify-center p-4">
                  {vendor.logo ? (
                    <Image src={vendor.logo} alt={vendor.name} fill className="object-contain p-4" />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-primary/10 to-secondary/10 flex items-center justify-center rounded-lg">
                      <Store className="w-12 h-12 text-primary/60" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover/vendor:opacity-100 transition-opacity duration-300" />
                </div>

                <h3 className="mt-3 text-sm md:text-base font-medium text-gray-700 group-hover/vendor:text-primary transition-colors text-center max-w-[140px] line-clamp-2">
                  {vendor.name}
                </h3>

                {vendor.rating > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-yellow-500">★</span>
                    <span className="text-xs text-gray-500">{vendor.rating.toFixed(1)}</span>
                  </div>
                )}
              </Link>
            )}
          />
        )}
      </section>

      {/* New Arrivals */}
      <section className="container mx-auto">
        {newLoading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <FeaturedProducts
            products={newProducts}
            title={t('newArrivals')}
            subtitle={t('newArrivalsSubtitle')}
            viewAllLink="/products?filter=new"
          />
        )}
      </section>

      {/* Newsletter */}
      <section className="container mx-auto">
        <Newsletter />
      </section>
    </div>
  );
}

