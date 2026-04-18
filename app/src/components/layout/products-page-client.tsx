"use client";

import { Suspense } from "react";
import { EntityListingPage } from "@/components/layout/entity-listing-page";

export function ProductsPageClient() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EntityListingPage type="products" />
    </Suspense>
  );
}