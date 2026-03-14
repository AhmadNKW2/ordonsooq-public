"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useInfiniteVendorBySlug } from "@/hooks/useVendors";
import { EntityListingPage } from "@/components/layout/entity-listing-page";
import { useSearchFilters, searchFiltersToApiFilters } from "@/lib/search/use-search-params";

export default function VendorPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { filters } = useSearchFilters();
  const apiFilters = searchFiltersToApiFilters(filters);

  const { data: infiniteData, isLoading: vendorLoading, error: vendorError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteVendorBySlug(slug, apiFilters);

  const vendorData = useMemo(() => {
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
        type="vendor"
        slug={slug}
        data={vendorData}
        isLoading={vendorLoading}
        error={vendorError}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
    />
  );
}
