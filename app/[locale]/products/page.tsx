"use client";

import { useTranslations } from "next-intl";
import { ProductListingPage } from "@/components/products/product-listing-page";
import { ListingLayout } from "@/components/layout/listing-layout";

export default function ProductsPage() {
  const t = useTranslations('product');
  const tCommon = useTranslations('common');
  const tNav = useTranslations('nav');

  return (
    <ListingLayout
       title={t('allProductsTitle')}
       subtitle={t('allProductsSubtitle')}
       breadcrumbs={[
          { label: tCommon("home"), href: "/" },
          { label: tNav("products"), href: "/products" },
       ]}
    >
      <ProductListingPage />
    </ListingLayout>
  );
}
