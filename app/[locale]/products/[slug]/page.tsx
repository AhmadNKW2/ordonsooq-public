import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { ProductPageClient } from "./product-page-client";
import type { Locale } from "@/i18n/message-catalog";
import { RouteIntlProvider } from "@/i18n/route-intl-provider";
import { PRODUCT_DETAIL_MESSAGE_NAMESPACES } from "@/i18n/scoped-messages";
import { productService } from "@/services/product.service";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: PageProps) {
  const locale = (await getLocale()) as Locale;
  const { slug } = await params;
  const productData = await productService.getBySlug(slug).catch(() => null);

  if (!productData) {
    notFound();
  }

  const linkedProductData = productData.linked_products?.length
    ? (await Promise.all(
        productData.linked_products.map((linkedProduct) => productService.getBySlug(linkedProduct.slug).catch(() => null)),
      )).filter((linkedProduct): linkedProduct is NonNullable<typeof linkedProduct> => Boolean(linkedProduct))
    : [];

  const categoryId = productData.categories?.[0]?.id;
  const relatedData = categoryId
    ? await productService.getByCategory(categoryId, { limit: 10, in_stock: true }).catch(() => null)
    : null;

  return (
    <RouteIntlProvider locale={locale} namespaces={PRODUCT_DETAIL_MESSAGE_NAMESPACES}>
      <ProductPageClient
        slug={slug}
        initialProductData={productData}
        initialRelatedData={relatedData}
        initialLinkedProductData={linkedProductData}
      />
    </RouteIntlProvider>
  );
}