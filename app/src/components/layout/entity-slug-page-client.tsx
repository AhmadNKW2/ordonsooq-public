"use client";

import { useMemo } from "react";
import { useInfiniteBrandBySlug } from "@/hooks/useBrands";
import { useInfiniteCategoryBySlug } from "@/hooks/useCategories";
import { useInfiniteVendorBySlug } from "@/hooks/useVendors";
import { EntityListingPage } from "@/components/layout/entity-listing-page";
import { searchFiltersToApiFilters } from "@/lib/search/filter-utils";
import { useSearchFilters } from "@/lib/search/use-search-params";
import type { BrandDetail, CategoryDetail, VendorDetail } from "@/types/api.types";

type EntityType = "brand" | "category" | "vendor";
type EntityData = BrandDetail | CategoryDetail | VendorDetail;

interface EntitySlugPageClientProps {
  type: EntityType;
  slug: string;
  initialData?: EntityData;
  initialPage?: number;
}

export function EntitySlugPageClient({
  type,
  slug,
  initialData,
  initialPage,
}: EntitySlugPageClientProps) {
  const { filters } = useSearchFilters();
  const apiFilters = searchFiltersToApiFilters(filters);

  const categoryQuery = useInfiniteCategoryBySlug(slug, apiFilters, {
    enabled: type === "category",
    initialData: type === "category" ? (initialData as CategoryDetail | undefined) : undefined,
    initialPage,
  });

  const brandQuery = useInfiniteBrandBySlug(slug, apiFilters, {
    enabled: type === "brand",
    initialData: type === "brand" ? (initialData as BrandDetail | undefined) : undefined,
    initialPage,
  });

  const vendorQuery = useInfiniteVendorBySlug(slug, apiFilters, {
    enabled: type === "vendor",
    initialData: type === "vendor" ? (initialData as VendorDetail | undefined) : undefined,
    initialPage,
  });

  const activeQuery = type === "category" ? categoryQuery : type === "brand" ? brandQuery : vendorQuery;

  const data = useMemo(() => {
    if (!activeQuery.data?.pages.length) {
      return initialData;
    }

    const firstPage = activeQuery.data.pages[0];
    const allProducts = activeQuery.data.pages.flatMap((page) => page.products || []);
    const lastPageMeta = activeQuery.data.pages.at(-1)?.productsMeta;

    return {
      ...firstPage,
      products: allProducts,
      productsMeta: lastPageMeta,
    };
  }, [activeQuery.data, initialData]);

  return (
    <EntityListingPage
      type={type}
      slug={slug}
      data={data}
      isLoading={activeQuery.isLoading}
      error={activeQuery.error}
      fetchNextPage={activeQuery.fetchNextPage}
      hasNextPage={activeQuery.hasNextPage}
      isFetchingNextPage={activeQuery.isFetchingNextPage}
    />
  );
}