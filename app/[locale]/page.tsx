"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { HeroBanner } from "@/components/home/hero-banner";
import { EntityCarousel, type EntityCarouselItem } from "@/components/home/entity-carousel";
import { ProductsSection } from "@/components/home/featured-products";
import { FeaturesSection } from "@/components/home/features-section";
import { Newsletter } from "@/components/home/newsletter";
import { useInfiniteProducts, useHome, useListingVariantProducts } from "@/hooks";
import { transformHomeData, type Locale } from "@/lib/transformers";
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

  // Fetch featured products with infinite pagination (25 per page)
  const {
    data: featuredInfiniteData,
    isPending: featuredLoading,
    isFetchingNextPage: featuredFetchingNext,
    hasNextPage: featuredHasNextPage,
    fetchNextPage: featuredFetchNextPage,
  } = useInfiniteProducts({
    limit: 25,
    status: 'active',
    visible: true,
    sortBy: 'average_rating',
    sortOrder: 'DESC',
  });

  // Flatten all fetched pages into a single array
  const featuredData = useMemo(
    () => featuredInfiniteData?.pages.flatMap((p) => p.data) ?? [],
    [featuredInfiniteData]
  );

  // Fetch new arrivals with infinite pagination (25 per page)
  const {
    data: newInfiniteData,
    isPending: newLoading,
    isFetchingNextPage: newFetchingNext,
    hasNextPage: newHasNextPage,
    fetchNextPage: newFetchNextPage,
  } = useInfiniteProducts({
    limit: 25,
    status: 'active',
    visible: true,
    sortBy: 'created_at',
    sortOrder: 'DESC',
  });

  // Flatten all fetched pages into a single array
  const newData = useMemo(
    () => newInfiniteData?.pages.flatMap((p) => p.data) ?? [],
    [newInfiniteData]
  );

  // Transform home data (categories, vendors, banners) with locale
  const { categories, vendors, banners, brands } = homeData 
    ? transformHomeData(homeData, locale) 
    : { categories: [], vendors: [], banners: [], brands: [] };

  const categoryItems: EntityCarouselItem[] = categories.map((category) => ({
    id: category.id,
    href: `/categories/${category.slug}`,
    name: category.name,
    image: category.image,
    isCategory: true,
  }));

  const brandItems: EntityCarouselItem[] = brands.map((brand) => ({
    id: brand.id,
    href: `/brands/${brand.slug}`,
    name: brand.name,
    image: brand.logo,
    isCategory: false,
  }));

  const vendorItems: EntityCarouselItem[] = vendors.map((vendor) => ({
    id: vendor.id,
    href: `/vendors/${vendor.slug}`,
    name: vendor.name,
    image: vendor.logo,
    isCategory: false,
  }));
  const { products: featuredProducts } = useListingVariantProducts(featuredData, locale);
  const { products: newProducts } = useListingVariantProducts(newData, locale);

  return (
    <>
      {/* Hero Banner */}
      <section className="pt-0">
        {homeLoading ? (
          <Skeleton className="h-100 rounded-2xl" />
        ) : (
          <HeroBanner banners={banners} />
        )}
      </section>

      {/* Categories Carousel */}
      <section>
        {homeLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <EntityCarousel
            title={t('shopByCategory')}
            subtitle={t('exploreCategories')}
              items={categoryItems}
              viewAllHref="/categories"
          />
        )}
      </section>

      {/* Featured Products */}
      <section>
        {featuredLoading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <ProductsSection
            products={featuredProducts}
            title={t('featuredProducts')}
            subtitle={t('featuredSubtitle')}
            hasMore={featuredHasNextPage ?? false}
            onLoadMore={() => featuredFetchNextPage()}
            isLoading={featuredFetchingNext}
          />
        )}
      </section>

      {/* Features Section */}
      <section>
        <FeaturesSection />
      </section>

      {/* Brands Section */}
      <section>
        {homeLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-r1" />
            ))}
          </div>
        ) : (
          <EntityCarousel
            title={t('shopByBrand')}
            subtitle={t('trustedBrands')}
              items={brandItems}
              viewAllHref="/brands"
          />
        )}
      </section>

      {/* Vendors Section */}
      <section>
        {homeLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-r1" />
            ))}
          </div>
        ) : (
          <EntityCarousel
            title={t('shopByVendor')}
            subtitle={t('trustedVendors')}
              items={vendorItems}
              viewAllHref="/vendors"
          />
        )}
      </section>

      {/* New Arrivals */}
      <section>
        {newLoading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <ProductsSection
            products={newProducts}
            title={t('newArrivals')}
            subtitle={t('newArrivalsSubtitle')}
            viewAllHref="/products?filter=new"
            hasMore={newHasNextPage ?? false}
            onLoadMore={() => newFetchNextPage()}
            isLoading={newFetchingNext}
          />
        )}
      </section>

      {/* Newsletter */}
      <section>
        <Newsletter />
      </section>
    </>
  );
}

