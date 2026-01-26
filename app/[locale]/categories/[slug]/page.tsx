"use client";

import { useParams } from "next/navigation";
import { useCategory } from "@/hooks";
import { EntityListingPage } from "@/components/layout/entity-listing-page";

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  // Extract category ID from slug (format: category-name-ID)
  const categoryId = parseInt(slug.split('-').pop() || '0', 10);

  const { data: categoryData, isLoading: categoryLoading, error: categoryError } = useCategory(categoryId);

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
