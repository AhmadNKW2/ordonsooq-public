"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  HeroBanner,
  CategoriesGrid,
  FeaturedProducts,
  FeaturesSection,
  Newsletter,
  VendorsSection,
  BrandsSection,
} from "@/components/home";
import { useProducts, useHome } from "@/hooks";
import { transformProducts, transformHomeData, type Locale } from "@/lib/transformers";
import { ProductGridSkeleton, CategoryCardSkeleton, Skeleton } from "@/components/ui/skeleton";

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

  console.log('Home data:', homeData);
  console.log('Featured data:', featuredData);
  console.log('New data:', newData);
  console.log('Errors:', { homeError, featuredError, newError });

  // Transform home data (categories, vendors, banners) with locale
  const { categories, vendors, banners, brands } = homeData 
    ? transformHomeData(homeData, locale) 
    : { categories: [], vendors: [], banners: [], brands: [] };

  // Transform and filter out of stock products with locale
  // Note: apiClient already unwraps the 'data' field, so featuredData IS the array
  const featuredProducts = featuredData
    ? transformProducts(featuredData, locale).filter(p => {
        console.log('Featured product:', p.name, 'stock:', p.stock);
        return p.stock > 0;
      }) 
    : [];
  const newProducts = newData
    ? transformProducts(newData, locale).filter(p => {
        console.log('New product:', p.name, 'stock:', p.stock);
        return p.stock > 0;
      }) 
    : [];
  
  console.log('Transformed featured products:', featuredProducts);
  console.log('Transformed new products:', newProducts);

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
          <CategoriesGrid 
            categories={categories} 
            title={t('shopByCategory')}
            subtitle={t('exploreCategories')}
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
          <BrandsSection 
            brands={brands} 
            title={t('shopByBrand')}
            subtitle={t('trustedBrands')}
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
          <VendorsSection 
            vendors={vendors} 
            title={t('shopByVendor')}
            subtitle={t('trustedVendors')}
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

