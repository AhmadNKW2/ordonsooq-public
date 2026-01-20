"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { useRootCategories } from "@/hooks";
import { transformCategories, type Locale } from "@/lib/transformers";
import { CategoryCardSkeleton } from "@/components/ui/skeleton";

export default function CategoriesPage() {
  const locale = useLocale() as Locale;
  const t = useTranslations('categories');
  const { data, isLoading, error } = useRootCategories({ 
    status: 'active',
    limit: 50,
    sortBy: 'sortOrder',
    sortOrder: 'ASC'
  });

  const categories = data?.data ? transformCategories(data.data, locale) : [];

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-secondary">{t('errorLoading')}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">{t('shopByCategory')}</h1>
        <p className="text-third">
          {t('shopByCategoryDesc')}
        </p>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <CategoryCardSkeleton key={i} />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-third">{t('noCategories')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((category) => {
            const subcategories = category.children || [];
            
            return (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group relative bg-white rounded-r1 border border-gray-100 shadow-s1 overflow-hidden hover:shadow-s1 transition-all duration-300"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                  
                  {/* Category Name on Image */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-third">
                      {category.name}
                    </h3>
                    {category.productCount !== undefined && (
                      <p className="text-sm text-third opacity-80">
                        {t('itemCount', { count: category.productCount })}
                      </p>
                    )}
                  </div>
                </div>

                {/* Subcategories */}
                {subcategories.length > 0 && (
                  <div className="p-4">
                    <p className="text-sm font-medium text-primary mb-3">{t('popularIn', { category: category.name })}</p>
                    <div className="flex flex-wrap gap-2">
                      {subcategories.slice(0, 4).map((sub) => (
                        <span
                          key={sub.id}
                          className="px-3 py-1 bg-gray-100 text-third text-sm rounded-full hover:bg-primary hover:text-third transition-colors"
                        >
                          {sub.name}
                        </span>
                      ))}
                      {subcategories.length > 4 && (
                        <span className="px-3 py-1 text-primary text-sm">
                          {t('more', { count: subcategories.length - 4 })}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* View Link */}
                <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowRight className="w-5 h-5 text-primary" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
