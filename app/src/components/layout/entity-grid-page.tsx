"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { ListingLayout } from "@/components/layout/listing-layout";
import { cn } from "@/lib/utils";
import { CategoryCardSkeleton } from "@/components/ui/skeleton";

interface EntityGridPageProps {
  type: 'brand' | 'category' | 'vendor';
  data: any[];
  isLoading: boolean;
  title: string;
  subtitle?: string;
  error?: any;
}

export function EntityGridPage({ type, data, isLoading, title, subtitle, error }: EntityGridPageProps) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const t = useTranslations();

  // Grid Configuration based on type
  const gridConfig = {
    brand: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    category: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    vendor: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  };

  const currentGridClass = gridConfig[type];

  // Breadcrumbs
  let rootBreadcrumb = { label: "", href: "" };
  if (type === 'brand') rootBreadcrumb = { label: t("nav.brands"), href: "/brands" };
  else if (type === 'category') rootBreadcrumb = { label: t("nav.categories"), href: "/categories" };
  else if (type === 'vendor') rootBreadcrumb = { label: t("nav.stores"), href: "/vendors" };

  // Render Loader
  if (isLoading) {
    return (
      <ListingLayout
        title={title}
        subtitle={subtitle}
        breadcrumbs={[
            { label: t("common.home"), href: "/" },
            rootBreadcrumb
        ]}
      >
        <div className={cn("grid gap-6", currentGridClass)}>
           {Array.from({ length: 8 }).map((_, i) => (
             type === 'category' ? 
               <CategoryCardSkeleton key={i} /> : 
               <div key={i} className={cn("bg-gray-100 rounded-xl animate-pulse", type === 'brand' ? "aspect-square" : "h-64")} />
           ))}
        </div>
      </ListingLayout>
    );
  }

  // Render Empty State
  if (!isLoading && data.length === 0) {
     return (
        <ListingLayout
            title={title}
            subtitle={subtitle}
            breadcrumbs={[
                { label: t("common.home"), href: "/" },
                rootBreadcrumb
            ]}
        >
            <div className="text-center py-20 bg-gray-50 rounded-2xl">
                <p className="text-lg text-gray-500">{t("common.noResults")}</p>
            </div>
        </ListingLayout>
     );
  }

  return (
    <ListingLayout
      title={title}
      subtitle={subtitle}
      breadcrumbs={[
        { label: t("common.home"), href: "/" },
        rootBreadcrumb,
      ]}
    >
      <div className={cn("grid gap-6", currentGridClass)}>
        {data.map((item) => {
          // Normalize Data
          let id, name, image, description, slug, rating;
          
          if (type === 'category') {
             id = item.id;
             name = item.name;
             slug = item.slug;
             image = item.image;
             description = item.productCount ? `${item.productCount} ${t("common.products")}` : undefined;
          } else if (type === 'brand') {
             id = item.id;
             name = isAr ? item.name_ar : item.name_en;
             slug = item.slug;
             image = item.logo;
          } else if (type === 'vendor') {
             id = item.id;
             name = isAr ? item.name_ar : item.name_en;
             slug = item.slug;
             image = item.logo;
             description = isAr ? item.description_ar : item.description_en;
             rating = 4.8; // Mocked
          }

          const href = `/${type === 'brand' ? 'brands' : type === 'vendor' ? 'vendors' : 'categories'}/${slug}`;

          // Render Card
          return (
             <Link
                key={id}
                href={href}
                className="group block h-full"
             >
                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden transition-all duration-300 group-hover:shadow-lg h-full flex flex-col">
                    <div className="relative h-40 bg-white flex items-center justify-center border-b border-gray-100">
                            {image ? (
                            <div className="relative w-full h-full rounded-lg">
                                <Image
                                    src={image}
                                    alt={name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            ) : (
                            <span className="text-2xl font-bold text-gray-300">{name?.[0]}</span>
                            )}
                    </div>
                    <div className="p-4 flex-grow flex flex-col items-center text-center">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
                            {name}
                        </h3>
                            
                        {type === 'vendor' && rating && (
                            <div className="flex items-center justify-center gap-1 text-yellow-500 mt-2">
                                <Star className="fill-current w-4 h-4" />
                                <span className="font-bold text-gray-900">{rating}</span>
                                <span className="text-gray-400 text-sm">(120)</span>
                            </div>
                        )}
                    </div>
                </div>
             </Link>
          );
        })}
      </div>
    </ListingLayout>
  );
}
