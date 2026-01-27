"use client";

import { useParams } from "next/navigation";
import { useCategoryBySlug } from "@/hooks";
import { EntityListingPage } from "@/components/layout/entity-listing-page";

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: categoryData, isLoading: categoryLoading, error: categoryError } = useCategoryBySlug(slug);

  return (
    <EntityListingPage 
        type="category"
        slug={slug}
        data={categoryData}
        isLoading={categoryLoading}
        error={categoryError}
    />
  );
}
