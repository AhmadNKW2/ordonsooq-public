"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { HeroBanner } from "@/components/home/hero-banner";
import { EntityCarousel, type EntityCarouselItem } from "@/components/home/entity-carousel";
import { ProductsSection } from "@/components/home/featured-products";
import { FeaturesSection } from "@/components/home/features-section";
import { Newsletter } from "@/components/home/newsletter";
import { useHome } from "@/hooks/useHome";
import { useInfiniteProducts } from "@/hooks/useProducts";
import { useListingVariantProducts } from "@/hooks/useListingVariantProducts";
import { transformHomeData, type Locale } from "@/lib/transformers";
import { CategoryCardSkeleton, ProductGridSkeleton, Skeleton } from "@/components/ui/skeleton";
export function HomePageClient() {
  const locale = useLocale() as Locale;
  const t = useTranslations("home");

  const { data: homeData, isLoading: homeLoading } = useHome();

  const productsPerPage = 40;

  const {
    data: featuredInfiniteData,
    isPending: featuredLoading,
    isFetchingNextPage: featuredFetchingNext,
    hasNextPage: featuredHasNextPage,
    fetchNextPage: featuredFetchNextPage,
  } = useInfiniteProducts(
    {
      limit: productsPerPage,
      status: "active",
      visible: true,
      sortBy: "average_rating",
      sortOrder: "DESC",
    },
  );

  const featuredData = useMemo(
    () => featuredInfiniteData?.pages.flatMap((page) => page.data) ?? [],
    [featuredInfiniteData],
  );

  const {
    data: newInfiniteData,
    isPending: newLoading,
    isFetchingNextPage: newFetchingNext,
    hasNextPage: newHasNextPage,
    fetchNextPage: newFetchNextPage,
  } = useInfiniteProducts(
    {
      limit: productsPerPage,
      status: "active",
      visible: true,
      sortBy: "created_at",
      sortOrder: "DESC",
    },
  );

  const newData = useMemo(
    () => newInfiniteData?.pages.flatMap((page) => page.data) ?? [],
    [newInfiniteData],
  );

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
      <section className="pt-0">
        {homeLoading ? <Skeleton className="h-100 rounded-2xl" /> : <HeroBanner banners={banners} />}
      </section>

      <section>
        {homeLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <CategoryCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <EntityCarousel
            title={t("shopByCategory")}
            subtitle={t("exploreCategories")}
            items={categoryItems}
            viewAllHref="/categories"
          />
        )}
      </section>

      <section>
        {featuredLoading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <ProductsSection
            products={featuredProducts}
            title={t("featuredProducts")}
            subtitle={t("featuredSubtitle")}
            hasMore={featuredHasNextPage ?? false}
            onLoadMore={() => featuredFetchNextPage()}
            isLoading={featuredFetchingNext}
          />
        )}
      </section>

      <section>
        <FeaturesSection />
      </section>

      <section>
        {newLoading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <ProductsSection
            products={newProducts}
            title={t("newArrivals")}
            subtitle={t("newArrivalsSubtitle")}
            viewAllHref="/products?filter=new"
            hasMore={newHasNextPage ?? false}
            onLoadMore={() => newFetchNextPage()}
            isLoading={newFetchingNext}
          />
        )}
      </section>

      <section>
        <Newsletter />
      </section>
    </>
  );
}