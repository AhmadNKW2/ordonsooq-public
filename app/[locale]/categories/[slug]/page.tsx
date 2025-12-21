"use client";

import { notFound, useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import { useCategory, useProductsByCategory } from "@/hooks";
import { transformCategory, transformProducts, type Locale } from "@/lib/transformers";
import { ProductGrid } from "@/components/products";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { PageWrapper, Breadcrumb } from "@/components/ui";

export default function CategoryPage() {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const params = useParams();
  const slug = params.slug as string;
  
  // Extract category ID from slug (format: category-name-ID)
  const categoryId = parseInt(slug.split('-').pop() || '0', 10);

  const { data: categoryData, isLoading: categoryLoading, error: categoryError } = useCategory(categoryId);
  const { data: productsData, isLoading: productsLoading } = useProductsByCategory(categoryId, {
    limit: 20,
    status: 'active'
  });

  if (categoryLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-48 md:h-64 bg-gray-200 animate-pulse rounded-lg" />
        <ProductGridSkeleton count={8} />
      </div>
    );
  }

  if (categoryError || !categoryData) {
    notFound();
  }

  const category = transformCategory(categoryData, locale);
  const products = productsData?.data ? transformProducts(productsData.data, locale) : [];
  const subcategories = category.children || [];

  // Get parent category for breadcrumb
  const parentCategory = categoryData.parent ? {
    id: String(categoryData.parent.id),
    name: locale === 'ar' ? (categoryData.parent.name_ar || categoryData.parent.name_en) : categoryData.parent.name_en,
    slug: categoryData.parent.name_en.toLowerCase().replace(/\s+/g, '-') + '-' + categoryData.parent.id,
  } : null;

  return (
    <PageWrapper className="container mx-auto">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb 
          items={[
            { label: "Categories", href: "/categories" },
            ...(parentCategory ? [{ label: parentCategory.name, href: `/categories/${parentCategory.slug}` }] : []),
            { label: category.name }
          ]} 
        />
      </div>

      {/* Category Header */}
      <div className="relative h-48 md:h-64 rounded-r1 overflow-hidden mb-8">
        <Image
          src={category.image || "/placeholder.svg"}
          alt={category.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/70 to-black/30" />
        <div className="absolute inset-0 flex flex-col justify-center p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-third">
            {category.name}
          </h1>
          <p className="text-third opacity-80">
            {products.length > 0 ? `${products.length} products available` : 'Browse products'}
          </p>
        </div>
      </div>

      {/* Subcategories */}
      {subcategories.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-bold text-primary mb-4">Shop by Subcategory</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {subcategories.map((sub) => (
              <Link
                key={sub.id}
                href={`/categories/${sub.slug}`}
                className="group flex flex-col items-center p-4 bg-white rounded-r1 border border-gray-100 shadow-s1 hover:shadow-s1 hover:border-primary/20 transition-all duration-300"
              >
                <div className="relative w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-third">
                    {sub.name.charAt(0)}
                  </span>
                </div>
                <span className="text-sm font-medium text-primary text-center group-hover:text-primary transition-colors">
                  {sub.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-primary">
            All {category.name} Products
          </h2>
          <span className="text-sm text-third">
            {productsLoading ? 'Loading...' : `${products.length} products found`}
          </span>
        </div>
        
        {productsLoading ? (
          <ProductGridSkeleton count={8} />
        ) : products.length > 0 ? (
          <ProductGrid products={products} columns={4} />
        ) : (
          <div className="text-center py-16">
            <p className="text-third">No products found in this category yet.</p>
            <Link href="/products" className="text-primary hover:underline">
              Browse all products
            </Link>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
