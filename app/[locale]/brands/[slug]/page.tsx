"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useInfiniteBrandBySlug } from "@/hooks/useBrands";
import { EntityListingPage } from "@/components/layout/entity-listing-page";
import { useSearchFilters, searchFiltersToApiFilters } from "@/lib/search/use-search-params";

export default function BrandPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { filters } = useSearchFilters();
  const apiFilters = searchFiltersToApiFilters(filters);

  const { data: infiniteData, isLoading: brandLoading, error: brandError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteBrandBySlug(slug, apiFilters);

  const brandData = useMemo(() => {
    if (!infiniteData?.pages.length) return undefined;
    const firstPage = infiniteData.pages[0];
    const allProducts = infiniteData.pages.flatMap((page) => page.products || []);
    const lastPageMeta = infiniteData.pages.at(-1)?.productsMeta;

    return {
      ...firstPage,
      products: allProducts,
      productsMeta: lastPageMeta
    };
  }, [infiniteData]);

  return (
    <EntityListingPage
        type="brand"
        slug={slug}
        data={brandData}
        isLoading={brandLoading}
        error={brandError}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
    />
  );
}
