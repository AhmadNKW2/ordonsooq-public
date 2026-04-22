"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { notFound, useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Check,
  ChevronRight,
  MessageSquareText,
  RotateCcw,
  Send,
  Shield,
  Star,
  Store,
  Truck,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/use-wishlist";
import { useListingVariantProducts } from "@/hooks/useListingVariantProducts";
import { useProductBySlug, useProductsByCategory } from "@/hooks/useProducts";
import { apiClient } from "@/lib/api-client";
import { CURRENCY_CONFIG } from "@/lib/constants";
import { transformProduct, type Locale } from "@/lib/transformers";
import { calculateDiscount, cn, formatPrice } from "@/lib/utils";
import { ProductGallery } from "@/components/products/product-gallery";
import { ProductOptionChip } from "@/components/products/product-option-chip";
import { ProductOptions } from "@/components/products/product-options";
import { ProductsSection } from "@/components/home/featured-products";
import { ProductReviews } from "@/components/products/product-reviews";
import { Badge, Breadcrumb, Button, Card, IconButton, Modal } from "@/components/ui";
import { ProductActions } from "./product-actions";
import type {
  PaginatedResponse,
  Product as ApiProduct,
  ProductDetail as ApiProductDetail,
  ProductLinkedProduct,
} from "@/types/api.types";
import { toast } from "sonner";

interface ProductPageClientProps {
  slug: string;
  initialProductData?: ApiProductDetail | null;
  initialRelatedData?: PaginatedResponse<ApiProduct> | null;
}

function ProductHeader({ product, selectedOptionsSummary, t }: { product: any; selectedOptionsSummary: string; t: any }) {
  return (
    <>
      {product.brand ? (
        <div className="flex items-center gap-2 mb-2">
          {product.brand.slug ? (
            <Link
              href={`/brands/${product.brand.slug}`}
              className="flex items-center gap-1 text-sm text-secondary font-medium ltr:hover:translate-x-1.5 rtl:hover:-translate-x-1.5 transition-all"
            >
              {product.brand.name}
              <ChevronRight size={16} className="rtl:rotate-180" />
            </Link>
          ) : (
            <span className="flex items-center gap-1 text-sm text-secondary font-medium">{product.brand.name}</span>
          )}
        </div>
      ) : null}
      <h1 className="text-2xl md:text-3xl font-bold text-primary leading-11">
        {product.name}
        {selectedOptionsSummary ? (
          <span className="mt-2 block font-medium text-third text-sm md:text-base">
            {" "}({selectedOptionsSummary})
          </span>
        ) : null}
      </h1>
      <div className="flex items-center gap-1 mt-2">
        <Star size={16} className="fill-secondary text-secondary mb-1" />
        <span className="text-sm font-bold text-primary">{product.rating || 0}</span>
        {product.reviewCount > 0 ? <span className="text-sm text-gray-500">({product.reviewCount || 0})</span> : null}
      </div>
    </>
  );
}

function ProductNotes({ t, productId }: { t: any; productId: string | number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { user } = useAuth();
  const translations = t || ((key: string) => key);

  const handleSubmit = async () => {
    if (!notes.trim()) {
      toast.error(translations("product.addNotesHere"));
      return;
    }

    if (!user) {
      if (!guestName.trim() || !guestPhone.trim()) {
        toast.error("Please fill in your name and phone number to submit a note.");
        return;
      }

      if (guestEmail.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(guestEmail.trim())) {
          toast.error(translations("product.invalidEmail") || "Please enter a valid email address.");
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        product_id: productId,
        notes: notes.trim(),
      };

      let requestOptions: RequestInit | undefined;

      if (!user) {
        payload.guest_name = guestName.trim();
        payload.guest_phone = guestPhone.trim();
        if (guestEmail.trim()) {
          payload.guest_email = guestEmail.trim();
        }

        requestOptions = {
          headers: {
            Authorization: "",
          },
        };
      }

      await apiClient.post("/notes", payload, requestOptions);
      setIsSuccess(true);
    } catch {
      toast.error(translations("common.error") || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
          setIsSuccess(false);
          setNotes("");
          setGuestName("");
          setGuestPhone("");
          setGuestEmail("");
        }}
        className="w-full group relative overflow-hidden bg-secondary/7 hover:bg-secondary/10 border border-secondary/50 hover:border-secondary/30 hover:shadow-sm rounded-2xl p-4 transition-all duration-300 flex items-center justify-between outline-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-secondary/20 transition-all duration-300">
            <MessageSquareText className="w-5 h-5 text-secondary" />
          </div>
          <div className="text-left rtl:text-right">
            <h3 className="text-sm font-bold text-primary transition-colors">{t("product.doYouHaveNotes")}</h3>
            <p className="text-xs text-third mt-0.5 line-clamp-1">{t("product.addNotesHere")}</p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-white group-hover:bg-white flex items-center justify-center transition-colors border border-secondary/50 group-hover:border-secondary/75">
          <ChevronRight className="w-4 h-4 text-third group-hover:text-secondary transition-colors rtl:rotate-180" />
        </div>
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} animation="zoom" className="max-w-md w-full p-0 overflow-hidden">
        {!isSuccess ? (
          <div className="p-5 ltr:pr-12 rtl:pl-12 bg-linear-to-br from-secondary/5 to-white border-b border-gray-100 relative">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                <MessageSquareText className="w-4 h-4 text-secondary" />
              </div>
              <span>{t("product.doYouHaveNotes")}</span>
            </h3>
          </div>
        ) : null}
        <div className="p-5">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-primary mb-2">{translations("common.success") || "Thank You!"}</h4>
                <p className="text-third text-sm">
                  {translations("product.notesSubmittedSuccessMessage") || "Your notes have been successfully submitted. We will review them shortly."}
                </p>
              </div>
              <Button variant="solid" onClick={() => setIsOpen(false)} className="rounded-xl px-8 mt-4">
                {translations("common.close") || "Close"}
              </Button>
            </div>
          ) : (
            <>
              {!user ? (
                <div className="flex flex-col gap-3 mb-4">
                  <p className="text-xs text-third">{translations("product.guestDetails") || "Please provide your details so we can assist you."}</p>
                  <input
                    type="text"
                    placeholder={`${translations("product.fullName") || "Full Name"} *`}
                    value={guestName}
                    onChange={(event) => setGuestName(event.target.value)}
                    disabled={isSubmitting}
                    className="w-full text-sm p-3 border border-gray-200 bg-gray-50/50 rounded-xl focus:bg-white focus:ring-2 focus:ring-secondary/20 outline-none text-primary"
                  />
                  <input
                    type="tel"
                    placeholder={`${translations("product.phoneNumber") || "Phone Number"} *`}
                    value={guestPhone}
                    onChange={(event) => setGuestPhone(event.target.value)}
                    disabled={isSubmitting}
                    className="w-full text-sm p-3 border border-gray-200 bg-gray-50/50 rounded-xl focus:bg-white focus:ring-2 focus:ring-secondary/20 outline-none text-primary"
                  />
                  <input
                    type="email"
                    placeholder={translations("product.emailOptional") || "Email (Optional)"}
                    value={guestEmail}
                    onChange={(event) => setGuestEmail(event.target.value)}
                    disabled={isSubmitting}
                    className="w-full text-sm p-3 border border-gray-200 bg-gray-50/50 rounded-xl focus:bg-white focus:ring-2 focus:ring-secondary/20 outline-none text-primary"
                  />
                </div>
              ) : null}

              <textarea
                className="w-full text-sm p-4 border border-gray-200 bg-gray-50/50 rounded-xl focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-secondary/50 outline-none resize-none text-primary placeholder:text-gray-400 transition-all min-h-25 shadow-inner"
                placeholder={translations("product.addNotesHere")}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                disabled={isSubmitting}
                autoFocus
              ></textarea>

              <div className="flex ltr:justify-end rtl:justify-start mt-2 gap-3">
                <Button variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl px-5" disabled={isSubmitting}>
                  {translations("common.cancel")}
                </Button>
                <Button
                  variant="solid"
                  onClick={() => void handleSubmit()}
                  isLoading={isSubmitting}
                  className="rounded-xl px-6 flex items-center gap-2 shadow-md hover:-translate-y-0.5"
                >
                  {translations("product.submitNotes")}
                  <Send className="w-4 h-4 rtl:rotate-y-180" />
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}

function ProductPrice(props: any) {
  const { currentPrice, currentCompareAtPrice, discount, t, locale, className = "" } = props;
  return (
    <div className={cn("flex items-center gap-3 flex-wrap", className)}>
      <p className="text-2xl md:text-3xl font-bold text-primary">{formatPrice(currentPrice, CURRENCY_CONFIG.code, locale)}</p>
      {currentCompareAtPrice && currentCompareAtPrice > currentPrice ? (
        <>
          <p className="text-lg md:text-xl text-gray-400 line-through">
            {formatPrice(currentCompareAtPrice, CURRENCY_CONFIG.code, locale)}
          </p>
          {discount > 0 ? (
            <Badge variant="sale">
              {t("product.save", {
                amount: formatPrice(currentCompareAtPrice - currentPrice, CURRENCY_CONFIG.code, locale),
              })}
            </Badge>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function WishlistBtn({ product, selectedVariant, toggleItem, isInWishlist, isItemLoading, t, className }: any) {
  const variantId = selectedVariant ? parseInt(selectedVariant.id, 10) : null;
  const inWishlist = isInWishlist(product.id, variantId);
  const loading = isItemLoading(product.id, variantId);

  return (
    <IconButton
      onClick={() => toggleItem(product, variantId)}
      isActive={inWishlist}
      isLoading={loading}
      className={className}
      aria-label={inWishlist ? t("product.removeFromWishlist") : t("product.addToWishlist")}
      icon="heart"
      shape="circle"
      variant="wishlist"
    />
  );
}

type LinkedProductChoice = {
  id: number;
  slug: string;
  sku: string;
  name: string;
  label: string;
  isCurrent: boolean;
};

function sortChoices<T extends { label: string; name: string; id: number }>(choices: T[], locale: Locale) {
  const collator = new Intl.Collator(locale === "ar" ? "ar" : "en", {
    numeric: true,
    sensitivity: "base",
  });

  return [...choices].sort((left, right) => {
    const labelComparison = collator.compare(left.label || left.name, right.label || right.name);
    if (labelComparison !== 0) return labelComparison;

    const nameComparison = collator.compare(left.name, right.name);
    if (nameComparison !== 0) return nameComparison;

    return left.id - right.id;
  });
}

function getLocalizedApiProductName(
  product: Pick<ApiProductDetail, "name_en" | "name_ar"> | ProductLinkedProduct,
  locale: Locale,
) {
  if (locale === "ar") {
    return product.name_ar || product.name_en || "";
  }

  return product.name_en || product.name_ar || "";
}

function getLongestCommonPrefix(values: string[]) {
  if (values.length === 0) return "";

  let prefix = values[0];

  for (const value of values.slice(1)) {
    let index = 0;
    while (index < prefix.length && index < value.length && prefix[index] === value[index]) {
      index += 1;
    }
    prefix = prefix.slice(0, index);
    if (!prefix) break;
  }

  return prefix;
}

function getLinkedProductLabel(name: string, commonPrefix: string) {
  const normalizedName = name.trim();
  if (!normalizedName) return "";

  const trimmedPrefix = commonPrefix.trimEnd();
  if (!trimmedPrefix || trimmedPrefix.length < 8 || !normalizedName.startsWith(trimmedPrefix)) {
    return normalizedName;
  }

  const candidate = normalizedName.slice(trimmedPrefix.length).replace(/^[\s\-–—:|/]+/, "").trim();
  return candidate && candidate.length < normalizedName.length ? candidate : normalizedName;
}

function dedupeLinkedProductChoices(choices: LinkedProductChoice[], locale: Locale) {
  const normalizedLocale = locale === "ar" ? "ar" : "en";
  const dedupedChoices = new Map<string, LinkedProductChoice>();

  for (const choice of choices) {
    const visibleValue = (choice.label || choice.name).trim().toLocaleLowerCase(normalizedLocale);
    const fullName = choice.name.trim().toLocaleLowerCase(normalizedLocale);
    const dedupeKey = `${visibleValue}::${fullName}`;
    const existingChoice = dedupedChoices.get(dedupeKey);

    if (!existingChoice || choice.isCurrent) {
      dedupedChoices.set(dedupeKey, choice);
    }
  }

  return Array.from(dedupedChoices.values());
}

function buildLinkedProductChoices(productData: ApiProductDetail, locale: Locale): LinkedProductChoice[] {
  const currentChoice = {
    id: productData.id,
    slug: productData.slug,
    sku: productData.sku,
    name: getLocalizedApiProductName(productData, locale),
    isCurrent: true,
  };

  const linkedChoices = (productData.linked_products || []).map((linkedProduct) => ({
    id: linkedProduct.id,
    slug: linkedProduct.slug,
    sku: linkedProduct.sku,
    name: getLocalizedApiProductName(linkedProduct, locale),
    isCurrent: false,
  }));

  const allChoices = [currentChoice, ...linkedChoices];
  const commonPrefix = getLongestCommonPrefix(allChoices.map((choice) => choice.name));
  const normalizedChoices = allChoices.map((choice) => ({
    ...choice,
    label: getLinkedProductLabel(choice.name, commonPrefix),
  }));

  return sortChoices(dedupeLinkedProductChoices(normalizedChoices, locale), locale);
}

function LinkedProductChoices({ title, groupName, choices }: { title: string; groupName?: string; choices: LinkedProductChoice[] }) {
  if (choices.length <= 1) return null;

  return (
    <div className="flex flex-col gap-3">
      {groupName ? (
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-third">{title}</p>
          <h3 className="font-semibold text-primary text-sm">{groupName}</h3>
        </div>
      ) : (
        <h3 className="font-semibold text-primary text-sm">{title}</h3>
      )}
      <div className="flex flex-wrap gap-2">
        {choices.map((choice) => {
          return (
            <ProductOptionChip
              key={choice.id}
              label={choice.label}
              selected={choice.isCurrent}
              href={choice.isCurrent ? undefined : `/products/${choice.slug}`}
              title={choice.name}
            />
          );
        })}
      </div>
    </div>
  );
}

function ProductSellerCard({
  product,
  vendorHref,
  t,
  className,
}: {
  product: any;
  vendorHref?: string;
  t: any;
  className?: string;
}) {
  return (
    <Card className={cn("p-4 flex flex-col gap-4", className)}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {product.vendor?.logo ? (
            <Image
              src={product.vendor.logo}
              alt={product.vendor.name}
              width={48}
              height={48}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <Store className="w-6 h-6 text-third" />
            </div>
          )}
          <div>
            <p className="text-xs text-third">{t("product.soldBy")}</p>
            {vendorHref ? (
              <Link
                href={vendorHref}
                className="font-semibold text-primary hover:text-secondary ltr:hover:translate-x-1.5 rtl:hover:-translate-x-1.5 transition-all flex items-center gap-1"
              >
                {product.vendor?.name || "OrdonSooq"}
                <ChevronRight className="w-4 h-4 rtl:rotate-180" />
              </Link>
            ) : (
              <span className="font-semibold text-primary flex items-center gap-1">{product.vendor?.name || "OrdonSooq"}</span>
            )}
            {product.vendor ? (
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3 h-3 text-secondary" />
                <span className="text-xs text-third">
                  {product.vendor.rating} {t("product.reviewCount", { count: product.vendor.reviewCount })}
                </span>
                {(() => {
                  const positivePercent = Math.round((product.vendor.rating / 5) * 100);
                  if (!(positivePercent > 75)) return null;
                  return (
                    <span className="text-green-600 font-medium text-xs ml-1">
                      {t("product.positiveFeedback", { percent: positivePercent })}
                    </span>
                  );
                })()}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}

function ProductMetaCard({
  product,
  currentSku,
  categoryHref,
  brandHref,
  t,
  className,
}: {
  product: any;
  currentSku: string;
  categoryHref?: string;
  brandHref?: string;
  t: any;
  className?: string;
}) {
  return (
    <Card className={cn("p-4", className)}>
      <div className="text-sm text-third flex flex-col gap-2">
        <p>
          {t("product.sku")}: <span className="text-primary">{currentSku}</span>
        </p>
        <p>
          {t("product.category")}: {categoryHref ? <Link href={categoryHref} className="text-primary hover:underline">{product.category.name}</Link> : <span className="text-primary">{product.category.name}</span>}
        </p>
        {product.tags.length > 0 ? (
          <div className="flex items-center gap-2 flex-wrap">
            <span>{t("product.tags")}:</span>
            {product.tags.map((tag: string) => (
              <Link
                key={tag}
                href={`/products?tag=${encodeURIComponent(tag)}`}
                className="text-primary hover:underline"
              >
                {tag}
              </Link>
            ))}
          </div>
        ) : null}
        {product.brand ? (
          <p>
            {t("product.brand")}: {brandHref ? <Link href={brandHref} className="text-primary hover:underline">{product.brand.name}</Link> : <span className="text-primary">{product.brand.name}</span>}
          </p>
        ) : null}
      </div>
    </Card>
  );
}

export function ProductPageClient({ slug, initialProductData, initialRelatedData }: ProductPageClientProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const searchParams = useSearchParams();
  const { toggleItem, isInWishlist, isItemLoading } = useWishlist();

  const requestedVariantId = useMemo(() => {
    const rawValue = searchParams.get("variant") ?? searchParams.get("variantId");
    const id = rawValue ? parseInt(rawValue, 10) : Number.NaN;
    return Number.isFinite(id) ? String(id) : undefined;
  }, [searchParams]);

  const { data: productData, isLoading, error } = useProductBySlug(slug, {
    initialData: initialProductData ?? undefined,
  });

  const categoryId = productData?.categories?.[0]?.id ?? initialProductData?.categories?.[0]?.id;
  const { data: relatedData } = useProductsByCategory(
    categoryId || 0,
    { limit: 4, status: "active" },
    {
      enabled: !!categoryId,
      initialData: initialRelatedData ?? undefined,
    },
  );

  const product = useMemo(() => {
    if (!productData) return null;
    return transformProduct(productData, locale);
  }, [productData, locale]);

  const { products: relatedProductsRaw } = useListingVariantProducts(relatedData?.data, locale);
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return relatedProductsRaw.filter((candidate) => candidate.id !== product.id).slice(0, 4);
  }, [relatedProductsRaw, product]);

  const linkedProductChoices = useMemo(() => {
    if (!productData) return [];
    return buildLinkedProductChoices(productData, locale);
  }, [productData, locale]);

  const variantAttributes = useMemo(
    () => (product?.attributes || []).filter((attribute) => attribute.attributeType !== "spec_attribute"),
    [product?.attributes],
  );

  const linkedOptionsGroupName = useMemo(
    () => variantAttributes.find((attribute) => attribute.name.trim().length > 0)?.name,
    [variantAttributes],
  );

  const selectableAttributes = useMemo(
    () => variantAttributes.filter((attribute) => attribute.values.length > 0),
    [variantAttributes],
  );

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    setSelectedOptions({});
    setHasInitialized(false);
  }, [product?.id, locale, requestedVariantId]);

  useEffect(() => {
    if (!product || hasInitialized) return;

    let targetOptions: Record<string, string> = {};

    if (product.variants && product.variants.length > 0) {
      if (requestedVariantId) {
        const matchingVariant = product.variants.find((variant) => String(variant.id) === requestedVariantId);
        if (matchingVariant) {
          targetOptions = { ...matchingVariant.attributes };
        }
      }

      if (Object.keys(targetOptions).length === 0) {
        let defaultVariant = product.variants.find((variant) => variant.stock > 0);
        if (!defaultVariant) {
          defaultVariant = product.variants[0];
        }
        if (defaultVariant) {
          targetOptions = { ...defaultVariant.attributes };
        }
      }
    }

    if (selectableAttributes.length > 0) {
      selectableAttributes.forEach((attribute) => {
        if (!targetOptions[attribute.name] && attribute.values.length === 1) {
          targetOptions[attribute.name] = attribute.values[0].value;
        }
      });
    }

    if (Object.keys(targetOptions).length > 0) {
      setSelectedOptions(targetOptions);
    }
    setHasInitialized(true);
  }, [product, requestedVariantId, hasInitialized, selectableAttributes]);

  const selectedVariant = useMemo(() => {
    if (!product?.variants) return undefined;
    return product.variants.find((variant) => {
      return Object.entries(selectedOptions).every(([key, value]) => {
        const variantValue = variant.attributes[key];
        return variantValue === value || variantValue === undefined;
      });
    });
  }, [product?.variants, selectedOptions]);

  const selectedOptionsSummary = useMemo(() => {
    if (selectableAttributes.length === 0) return "";

    const parts = selectableAttributes
      .map((attribute) => {
        const value = selectedOptions[attribute.name];
        return value ? `${attribute.name}: ${value}` : null;
      })
      .filter(Boolean) as string[];

    return parts.join(" • ");
  }, [selectableAttributes, selectedOptions]);

  const specificationAttributes = useMemo(() => {
    return (product?.attributes || []).filter((attribute) => {
      if (attribute.values.length > 0) return true;
      return Boolean(selectedOptions[attribute.name]);
    });
  }, [product?.attributes, selectedOptions]);

  const selectedImageIndex = useMemo(() => {
    if (!product || !product.images) return 0;

    if (selectedVariant?.image) {
      const index = product.images.indexOf(selectedVariant.image);
      if (index >= 0) return index;
    }

    return 0;
  }, [product, selectedVariant]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  useEffect(() => {
    setActiveImageIndex(selectedImageIndex);
  }, [selectedImageIndex]);

  const handleOptionChange = (attributeName: string, value: string) => {
    if (!product?.variants) {
      setSelectedOptions((current) => ({ ...current, [attributeName]: value }));
      return;
    }

    const nextOptions = { ...selectedOptions, [attributeName]: value };

    const exactMatch = product.variants.find((variant) => {
      return Object.entries(nextOptions).every(([key, nextValue]) => {
        const variantValue = variant.attributes[key];
        return variantValue === nextValue || variantValue === undefined;
      });
    });

    if (exactMatch && exactMatch.stock > 0) {
      setSelectedOptions(nextOptions);
      return;
    }

    const candidates = product.variants.filter((variant) => {
      const variantValue = variant.attributes[attributeName];
      return (variantValue === value || variantValue === undefined) && variant.stock > 0;
    });

    if (candidates.length > 0) {
      const bestMatch = candidates.sort((left, right) => {
        let leftScore = 0;
        let rightScore = 0;

        Object.entries(selectedOptions).forEach(([key, selectedValue]) => {
          if (key === attributeName) return;

          const leftValue = left.attributes[key];
          const rightValue = right.attributes[key];

          if (leftValue === selectedValue || leftValue === undefined) leftScore += 1;
          if (rightValue === selectedValue || rightValue === undefined) rightScore += 1;
        });

        return rightScore - leftScore;
      })[0];

      const mergedOptions = { ...nextOptions, ...bestMatch.attributes };
      if (variantAttributes.length > 0) {
        variantAttributes.forEach((attribute) => {
          if (!mergedOptions[attribute.name] && attribute.values.length === 1) {
            mergedOptions[attribute.name] = attribute.values[0].value;
          }
        });
      }

      setSelectedOptions(mergedOptions);
      return;
    }

    const finalOptions = { ...nextOptions };
    if (variantAttributes.length > 0) {
      variantAttributes.forEach((attribute) => {
        if (!finalOptions[attribute.name] && attribute.values.length === 1) {
          finalOptions[attribute.name] = attribute.values[0].value;
        }
      });
    }

    setSelectedOptions(finalOptions);
  };

  const isOptionDisabled = (attributeName: string, value: string) => {
    if (!product?.variants) return false;

    const hasAnyInStockVariant = product.variants.some((variant) => {
      const variantValue = variant.attributes[attributeName];
      return (variantValue === value || variantValue === undefined) && variant.stock > 0;
    });

    return !hasAnyInStockVariant;
  };

  if (isLoading) {
    return (
      <div className="px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <div className="aspect-square bg-gray-200 animate-pulse rounded-lg" />
          </div>
          <div className="lg:col-span-4 flex flex-col gap-5">
            <div className="h-8 bg-gray-200 animate-pulse rounded w-3/4" />
            <div className="h-6 bg-gray-200 animate-pulse rounded w-1/2" />
            <div className="h-10 bg-gray-200 animate-pulse rounded w-1/3" />
            <div className="h-24 bg-gray-200 animate-pulse rounded" />
          </div>
          <div className="lg:col-span-3">
            <div className="h-48 bg-gray-200 animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    notFound();
  }

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentCompareAtPrice = selectedVariant?.compareAtPrice ? selectedVariant.compareAtPrice : product.compareAtPrice;
  const currentDimensions = selectedVariant?.dimensions || product.dimensions;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const currentSku = product.sku;
  const discount = currentCompareAtPrice ? calculateDiscount(currentCompareAtPrice, currentPrice) : 0;

  const galleryProps = {
    images: product.images,
    productName: product.name,
    initialIndex: selectedImageIndex,
    selectedIndex: activeImageIndex,
    onIndexChange: setActiveImageIndex,
    showThumbnails: true,
    showMainImage: true,
  };

  const wishlistBtnProps = {
    product,
    selectedVariant,
    toggleItem,
    isInWishlist,
    isItemLoading,
    t,
  };

  const categoryHref = product.category.slug ? `/categories/${product.category.slug}` : undefined;
  const vendorHref = product.vendor?.slug ? `/vendors/${product.vendor.slug}` : undefined;
  const brandHref = product.brand?.slug ? `/brands/${product.brand.slug}` : undefined;

  return (
    <>
      <Breadcrumb
        items={[
          { label: t("nav.products"), href: "/products" },
          ...(categoryHref ? [{ label: product.category.name, href: categoryHref }] : [{ label: product.category.name }]),
          { label: product.name },
        ]}
      />

      <div className="lg:hidden flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <ProductHeader product={product} selectedOptionsSummary={selectedOptionsSummary} t={t} />
        </div>

        <ProductGallery
          {...galleryProps}
          wishlistButton={
            <WishlistBtn
              {...wishlistBtnProps}
              className={cn(
                "shadow-sm shrink-0",
                !isInWishlist(product.id, selectedVariant ? parseInt(selectedVariant.id, 10) : null) && "bg-white/80 backdrop-blur-sm",
              )}
            />
          }
        />

        <div className="flex flex-col gap-5 mt-2">
          <ProductPrice
            currentPrice={currentPrice}
            currentCompareAtPrice={currentCompareAtPrice}
            discount={discount}
            t={t}
            locale={locale}
          />

          <ProductNotes t={t} productId={product.id} />

          <LinkedProductChoices title={t("product.chooseOptions")} groupName={linkedOptionsGroupName} choices={linkedProductChoices} />

          {selectableAttributes.length > 0 ? (
            <ProductOptions
              attributes={selectableAttributes}
              selectedOptions={selectedOptions}
              onChange={handleOptionChange}
              isOptionDisabled={isOptionDisabled}
            />
          ) : null}

          <ProductSellerCard product={product} vendorHref={vendorHref} t={t} />

          <ProductMetaCard
            product={product}
            currentSku={currentSku}
            categoryHref={categoryHref}
            brandHref={brandHref}
            t={t}
          />

          <ProductActions product={product} selectedVariant={selectedVariant} />
        </div>
      </div>

      <div className="hidden lg:grid lg:grid-cols-12 gap-8 mb-16">
        <div className="lg:col-span-5">
          <ProductGallery
            {...galleryProps}
            wishlistButton={
              <WishlistBtn
                {...wishlistBtnProps}
                className={cn(
                  "shadow-lg hover:scale-110",
                  !isInWishlist(product.id, selectedVariant ? parseInt(selectedVariant.id, 10) : null) && "bg-white/90 backdrop-blur-sm",
                )}
              />
            }
          />
        </div>

        <div className="lg:col-span-4 flex flex-col gap-5">
          <div className="flex items-center gap-2">
            {product.isNew ? <Badge variant="new">{t("product.new")}</Badge> : null}
            {discount > 0 ? <Badge variant="sale">{t("product.off", { percent: discount })}</Badge> : null}
            {currentStock <= 5 && currentStock > 0 ? <Badge variant="warning">{t("product.onlyLeft", { count: currentStock })}</Badge> : null}
          </div>

          <div className="[&_h1]:text-3xl">
            <ProductHeader product={product} selectedOptionsSummary={selectedOptionsSummary} t={t} />
          </div>

          <ProductPrice
            currentPrice={currentPrice}
            currentCompareAtPrice={currentCompareAtPrice}
            discount={0}
            t={t}
            locale={locale}
            className="items-baseline"
          />

          <ProductNotes t={t} productId={product.id} />

          <LinkedProductChoices title={t("product.chooseOptions")} groupName={linkedOptionsGroupName} choices={linkedProductChoices} />

          <div
            className="text-third leading-relaxed prose max-w-none [&_p]:text-third [&_a]:text-primary [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:marker:text-third"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />

          {selectableAttributes.length > 0 ? (
            <ProductOptions
              attributes={selectableAttributes}
              selectedOptions={selectedOptions}
              onChange={handleOptionChange}
              isOptionDisabled={isOptionDisabled}
            />
          ) : null}
        </div>

        <div className="lg:col-span-3 flex flex-col gap-5">
          <ProductSellerCard product={product} vendorHref={vendorHref} t={t} />

          {product.otherSellers && product.otherSellers.length > 0 ? (
            <Card className="p-4">
              <h3 className="font-semibold text-primary">{t("product.otherSellers", { count: product.otherSellers.length })}</h3>
              <div className="flex flex-col gap-3">
                {product.otherSellers.map((seller) => (
                  <div
                    key={seller.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="font-medium text-primary text-sm">{seller.name}</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-secondary text-secondary" />
                        <span className="text-xs text-third">{seller.rating}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{formatPrice(seller.price)}</p>
                      <button className="text-xs text-primary hover:underline">{t("product.viewOffer")}</button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}

          <ProductMetaCard
            product={product}
            currentSku={currentSku}
            categoryHref={categoryHref}
            brandHref={brandHref}
            t={t}
          />

          <ProductActions product={product} selectedVariant={selectedVariant} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 pt-6 border-t border-gray-100">
        <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-lg gap-1">
          <Truck className="w-6 h-6 text-primary" />
          <span className="text-sm font-medium">{t("product.features.freeShipping")}</span>
          <span className="text-xs text-third">{t("product.features.freeShippingDesc")}</span>
        </div>
        <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-lg gap-1">
          <RotateCcw className="w-6 h-6 text-primary" />
          <span className="text-sm font-medium">{t("product.features.returns")}</span>
          <span className="text-xs text-third">{t("product.features.returnsDesc")}</span>
        </div>
        <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-lg gap-1">
          <Shield className="w-6 h-6 text-primary" />
          <span className="text-sm font-medium">{t("product.features.secure")}</span>
          <span className="text-xs text-third">{t("product.features.secureDesc")}</span>
        </div>
      </div>

      {product.longDescription ? (
        <section>
          <h2 className="text-2xl font-bold text-primary mb-1">{t("product.description")}</h2>
          <Card className="p-8">
            <div
              className="prose max-w-none [&_h1]:text-primary [&_h2]:text-primary [&_h3]:text-primary [&_p]:text-third [&_a]:text-primary [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:marker:text-third"
              dangerouslySetInnerHTML={{ __html: product.longDescription }}
            />
            {product.descriptionImages && product.descriptionImages.length > 0 ? (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
                {product.descriptionImages.map((image, index) => (
                  <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                    <Image
                      src={image}
                      alt={`${product.name} - Description Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </Card>
        </section>
      ) : null}

      {(() => {
        const hasDimensions = currentDimensions && (currentDimensions.weight || currentDimensions.length || currentDimensions.width || currentDimensions.height);
        return specificationAttributes.length > 0 || hasDimensions;
      })() ? (
        <section>
          <h2 className="text-2xl font-bold text-primary mb-1">{t("product.specifications")}</h2>
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              {specificationAttributes.map((attribute) => (
                <div key={attribute.name} className="grid grid-cols-2 gap-4 py-3 border-b border-gray-100">
                  <span className="text-third font-medium">{attribute.name}</span>
                  <span className="text-primary font-semibold">
                    {attribute.attributeType === "spec_attribute"
                      ? attribute.values.map((value) => value.value).join(", ")
                      : selectedOptions[attribute.name] || attribute.values.map((value) => value.value).join(", ")}
                  </span>
                </div>
              ))}
              {currentDimensions ? (
                <>
                  {currentDimensions.weight ? (
                    <div className="grid grid-cols-2 gap-4 py-3 border-b border-gray-100">
                      <span className="text-third font-medium">{t("product.dims.weight")}</span>
                      <span className="text-primary font-semibold">{currentDimensions.weight} kg</span>
                    </div>
                  ) : null}
                  {currentDimensions.length ? (
                    <div className="grid grid-cols-2 gap-4 py-3 border-b border-gray-100">
                      <span className="text-third font-medium">{t("product.dims.length")}</span>
                      <span className="text-primary font-semibold">{currentDimensions.length} cm</span>
                    </div>
                  ) : null}
                  {currentDimensions.width ? (
                    <div className="grid grid-cols-2 gap-4 py-3 border-b border-gray-100">
                      <span className="text-third font-medium">{t("product.dims.width")}</span>
                      <span className="text-primary font-semibold">{currentDimensions.width} cm</span>
                    </div>
                  ) : null}
                  {currentDimensions.height ? (
                    <div className="grid grid-cols-2 gap-4 py-3 border-b border-gray-100">
                      <span className="text-third font-medium">{t("product.dims.height")}</span>
                      <span className="text-primary font-semibold">{currentDimensions.height} cm</span>
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          </Card>
        </section>
      ) : null}

      <section>
        <ProductReviews rating={product.rating} reviewCount={product.reviewCount} />
      </section>

      {relatedProducts.length > 0 ? (
        <section>
          <ProductsSection
            products={relatedProducts}
            title={t("product.relatedProducts")}
            subtitle={t("product.relatedProductsSubtitle")}
            viewAllHref={`/categories/${product.category.slug}`}
            showLoadMore={false}
            showNavArrows={true}
          />
        </section>
      ) : null}
    </>
  );
}