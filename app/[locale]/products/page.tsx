"use client";

import { Suspense } from "react";
import { EntityListingPage } from "@/components/layout/entity-listing-page";

export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EntityListingPage type="shop" />
    </Suspense>
  );
}
