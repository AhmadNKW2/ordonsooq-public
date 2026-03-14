"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useInfiniteCategoryBySlug } from "@/hooks";
import { EntityListingPage } from "@/components/layout/entity-listing-page";
import { useSearchFilters, searchFiltersToApiFilters } from "@/lib/search/use-search-params";

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { filters } = useSearchFilters();
  const apiFilters = searchFiltersToApiFilters(filters);

  const { data: infiniteData, isLoading: categoryLoading, error: categoryError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteCategoryBySlug(slug, apiFilters);

  const categoryData = useMemo(() => {
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
        type="category"
        slug={slug}
        data={categoryData}
        isLoading={categoryLoading}
        error={categoryError}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
    />
  );
}
