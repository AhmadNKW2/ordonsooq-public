"use client";

import { notFound, useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCategory } from "@/hooks";
import { transformCategory, type Locale } from "@/lib/transformers";
import { ProductListingPage } from "@/components/products/product-listing-page";
import { ListingLayout } from "@/components/layout/listing-layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoryPage() {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const params = useParams();
  const slug = params.slug as string;
  
  // Extract category ID from slug (format: category-name-ID)
  const categoryId = parseInt(slug.split('-').pop() || '0', 10);

  const { data: categoryData, isLoading: categoryLoading, error: categoryError } = useCategory(categoryId);
  
  const category = categoryData ? transformCategory(categoryData, locale) : null;

  if (categoryLoading) {
    return (
       <ListingLayout
         title={<Skeleton className="h-10 w-64" />}
         breadcrumbs={[
            { label: t("common.home"), href: "/" },
            { label: t("nav.categories"), href: "/categories" },
            { label: "...", href: "#" },
         ]}
       >
         <div className="space-y-4">
             <Skeleton className="h-32 w-full" />
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Skeleton className="h-screen w-full md:col-span-1" />
                <Skeleton className="h-screen w-full md:col-span-3" />
             </div>
         </div>
       </ListingLayout>
    );
  }

  if (categoryError || !category) {
    notFound();
  }

  const subcategories = category.children || [];

  return (
    <ListingLayout
      title={category.name}
      subtitle={category.description}
      breadcrumbs={[
        { label: t("common.home"), href: "/" },
        { label: t("nav.categories"), href: "/categories" },
        { label: category.name, href: `/categories/${slug}` },
      ]}
    >
       {/* Subcategories Circles */}
       {subcategories.length > 0 && (
         <div className="mb-10 overflow-x-auto pb-4">
            <div className="flex gap-4">
                {subcategories.map(sub => (
                    <Link 
                        key={sub.id} 
                        href={`/categories/${sub.slug}`}
                        className="flex-shrink-0 flex flex-col items-center gap-2 w-24 group"
                    >
                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border-2 border-transparent group-hover:border-primary transition-all">
                             {/* Placeholder icon/image */}
                             <span className="text-xl font-bold text-gray-400">
                                {sub.name.charAt(0)}
                             </span>
                        </div>
                        <span className="text-sm font-medium text-center text-gray-700 group-hover:text-primary">
                            {sub.name}
                        </span>
                    </Link>
                ))}
            </div>
         </div>
       )}

      <ProductListingPage 
        initialFilters={{ categoryId }}
        availableCategories={subcategories}
      />
    </ListingLayout>
  );
}
