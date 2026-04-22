"use client";

import { EntityListingPage } from "@/components/layout/entity-listing-page";
import type { BrandDetail, CategoryDetail, VendorDetail } from "@/types/api.types";
import type { SearchFilters, SearchResponse } from "@/lib/search/types";

type EntityType = "brand" | "category" | "vendor";
type EntityData = BrandDetail | CategoryDetail | VendorDetail;

interface EntitySlugPageClientProps {
  type: EntityType;
  slug: string;
  initialData?: EntityData;
  initialSearchFilters?: SearchFilters;
  initialSearchData?: SearchResponse | null;
}

export function EntitySlugPageClient({
  type,
  slug,
  initialData,
  initialSearchFilters,
  initialSearchData,
}: EntitySlugPageClientProps) {
  return (
    <EntityListingPage
      type={type}
      slug={slug}
      data={initialData}
      initialSearchFilters={initialSearchFilters}
      initialSearchData={initialSearchData}
    />
  );
}