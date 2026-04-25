"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  PhoneCall,
  ShieldCheck,
  Store,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { SITE_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { sellWithUsSchema, type SellWithUsFormData } from "@/lib/sell-with-us";

type SellWithUsCtaVariant = "desktop" | "drawer" | "compact";

interface SellWithUsCtaProps {
  variant?: SellWithUsCtaVariant;
  className?: string;
  onOpen?: () => void;
}

type SubmitResponse = {
  success: boolean;
};

async function submitSellWithUs(values: SellWithUsFormData): Promise<SubmitResponse> {
  const response = await fetch("/api/sell-with-us", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string"
        ? payload.message
        : "Unable to submit sell with us request.",
    );
  }

  return { success: true };
}

const triggerStyles: Record<SellWithUsCtaVariant, string> = {
  desktop:
    "hidden lg:inline-flex items-center gap-2 rounded-full border border-white/10 bg-secondary/10 px-3 py-1.5 text-sm font-medium text-white transition-all hover:bg-secondary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/25",
  drawer:
    "mx-auto flex w-fit items-center gap-2 rounded-full border border-secondary/15 bg-secondary/10 px-3 py-1.5 text-primary transition-all hover:bg-secondary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/20",
  compact:
    "mx-0 inline-flex w-auto shrink-0 items-center gap-1.5 rounded-md border border-secondary/20 bg-secondary/10 px-3 py-1.5 text-primary transition-all hover:bg-secondary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/20",
};

const sellWithUsCopy = {
  en: {
    button: "Sell with us",
    eyebrow: "Merchant onboarding",
    title: "Bring your store to shoppers across Jordan",
    description: "Tell us who you are and our team will contact you to launch your catalog, set up payments, and get your storefront live.",
    features: {
      fastTitle: "Fast onboarding",
      fastDescription: "Share your core details now and we will guide you through the next steps.",
      followUpTitle: "Real follow-up",
      followUpDescription: "A member of our merchant team will contact you to confirm your business info.",
      supportTitle: "Launch-ready support",
      supportDescription: "We help you prepare listings, pricing, and storefront visibility for launch.",
    },
    formTitle: "Tell us about your business",
    formDescription: "Fill in these details and we will get back to you shortly.",
    fields: {
      fullName: {
        label: "Full name",
        placeholder: "Enter your full name",
      },
      phone: {
        label: "Phone number",
        placeholder: "07XXXXXXXX",
      },
      companyName: {
        label: "Company name",
        placeholder: "Enter your company name",
      },
    },
    validation: {
      fullName: "Please enter your full name.",
      phone: "Please enter a valid phone number.",
      companyName: "Please enter your company name.",
    },
    submit: "Submit request",
    submitError: "We couldn't submit your request right now. Please try again.",
    footnote: "By submitting this form, you agree that our team may contact you by phone about store onboarding.",
    successTitle: "Your request is on its way",
    successDescription: "Thanks. Our merchant team will review your details and contact you soon.",
    done: "Close",
    contactPhoneLabel: "Call us",
    contactEmailLabel: "Email us",
  },
  ar: {
    button: "سجل متجرك الآن",
    eyebrow: "انضم كتاجر",
    title: "اعرض متجرك أمام المتسوقين في جميع أنحاء الأردن",
    description: "شاركنا بياناتك الأساسية وسيتواصل معك فريقنا لمساعدتك في تجهيز متجرك، إعداد المدفوعات، وإطلاق منتجاتك بسرعة.",
    features: {
      fastTitle: "بدء سريع",
      fastDescription: "أرسل بياناتك الأساسية الآن وسنرشدك مباشرة إلى الخطوات التالية.",
      followUpTitle: "متابعة مباشرة",
      followUpDescription: "سيتواصل معك أحد أعضاء فريق التجار لتأكيد معلومات نشاطك التجاري.",
      supportTitle: "دعم جاهز للإطلاق",
      supportDescription: "نساعدك في تجهيز المنتجات، التسعير، وإظهار المتجر بالشكل المناسب قبل الإطلاق.",
    },
    formTitle: "عرّفنا على نشاطك التجاري",
    formDescription: "املأ هذه البيانات وسنتواصل معك خلال وقت قصير.",
    fields: {
      fullName: {
        label: "الاسم الكامل",
        placeholder: "أدخل اسمك الكامل",
      },
      phone: {
        label: "رقم الهاتف",
        placeholder: "07XXXXXXXX",
      },
      companyName: {
        label: "اسم الشركة",
        placeholder: "أدخل اسم الشركة",
      },
    },
    validation: {
      fullName: "يرجى إدخال الاسم الكامل.",
      phone: "يرجى إدخال رقم هاتف صحيح.",
      companyName: "يرجى إدخال اسم الشركة.",
    },
    submit: "إرسال الطلب",
    submitError: "تعذر إرسال طلبك حالياً. يرجى المحاولة مرة أخرى.",
    footnote: "بإرسالك هذا النموذج فإنك توافق على أن يتواصل معك فريقنا هاتفياً بخصوص تسجيل متجرك.",
    successTitle: "تم استلام طلبك",
    successDescription: "شكراً لك. سيقوم فريق التجار بمراجعة بياناتك والتواصل معك قريباً.",
    done: "إغلاق",
    contactPhoneLabel: "اتصل بنا",
    contactEmailLabel: "راسلنا",
  },
} as const;

export function SellWithUsCta({ variant = "desktop", className, onOpen }: SellWithUsCtaProps) {
  const locale = useLocale();
  const tCommon = useTranslations("common");
  const copy = locale === "ar" ? sellWithUsCopy.ar : sellWithUsCopy.en;

  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SellWithUsFormData>({
    resolver: zodResolver(sellWithUsSchema),
    mode: "onBlur",
    defaultValues: {
      fullName: "",
      phone: "",
      companyName: "",
    },
  });

  const mutation = useMutation({
    mutationFn: submitSellWithUs,
    onSuccess: () => {
      setSubmitError(null);
      setIsSubmitted(true);
      reset();
    },
    onError: () => {
      setSubmitError(copy.submitError);
    },
  });

  const featureCards = [
    {
      icon: BadgeCheck,
      title: copy.features.fastTitle,
      description: copy.features.fastDescription,
    },
    {
      icon: PhoneCall,
      title: copy.features.followUpTitle,
      description: copy.features.followUpDescription,
    },
    {
      icon: ShieldCheck,
      title: copy.features.supportTitle,
      description: copy.features.supportDescription,
    },
  ];

  const openModal = () => {
    onOpen?.();
    setIsSubmitted(false);
    setSubmitError(null);
    mutation.reset();
    reset();
    setIsOpen(true);
  };

  const closeModal = () => {
    mutation.reset();
    setSubmitError(null);
    setIsSubmitted(false);
    reset();
    setIsOpen(false);
  };

  const onSubmit = (values: SellWithUsFormData) => {
    setSubmitError(null);
    mutation.mutate(values);
  };

  const getErrorMessage = (message?: string) => {
    if (message === "validation.fullName") {
      return copy.validation.fullName;
    }

    if (message === "validation.phone") {
      return copy.validation.phone;
    }

    if (message === "validation.companyName") {
      return copy.validation.companyName;
    }

    return undefined;
  };

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className={cn(triggerStyles[variant], className)}
      >
        <Store
          className={cn(
            "shrink-0 text-secondary",
            variant === "compact" ? "h-3.5 w-3.5" : "h-4 w-4"
          )}
        />
        <span
          className={cn(
            "leading-none text-start",
            variant === "compact" ? "flex items-center" : "flex flex-col"
          )}
        >
          {variant === "compact" ? null : (
            <span
              className={cn(
                "text-[10px] font-medium",
                variant === "desktop" ? "text-white/70" : "text-third"
              )}
            >
              {copy.eyebrow}
            </span>
          )}
          <span
            className={cn(
              variant === "compact" ? "text-sm font-semibold" : "text-sm font-bold",
              variant === "desktop" ? "text-white" : "text-primary"
            )}
          >
            {copy.button}
          </span>
        </span>
      </button>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        animation="slide-up"
        className="w-[calc(100%-2rem)] max-w-4xl max-h-[calc(100vh-2rem)] overflow-x-hidden overflow-y-auto rounded-3xl border border-primary/10 bg-white p-0 shadow-[0_40px_120px_rgba(9,33,67,0.24)] sm:w-[calc(100%-1.5rem)] sm:max-h-[calc(100vh-2rem)] sm:rounded-[28px]"
        backdropClassName="bg-primary/55 backdrop-blur-md"
        closeButtonClassName="border border-primary/10 bg-white/90 text-primary hover:bg-white hover:text-primary2"
      >
        <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative overflow-hidden bg-[linear-gradient(160deg,var(--color-primary)_0%,var(--color-primary2)_100%)] px-4 py-5 text-white sm:px-6 sm:py-8 lg:order-1 lg:px-8 lg:py-10">
            <div className="pointer-events-none absolute -left-16 top-8 h-44 w-44 rounded-full bg-secondary/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 right-0 h-44 w-44 rounded-full bg-white/10 blur-3xl" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-secondary backdrop-blur-sm">
                <Store className="h-4 w-4" />
                {copy.eyebrow}
              </div>

              <h2 className="mt-4 max-w-sm text-2xl font-black leading-tight text-white sm:mt-5 sm:text-3xl lg:text-[2.4rem]">
                {copy.title}
              </h2>

              <p className="mt-4 max-w-md text-sm leading-7 text-white/78 sm:text-base">
                {copy.description}
              </p>

              <div className="mt-6 hidden gap-3 sm:grid sm:mt-7">
                {featureCards.map(({ icon: Icon, title, description }) => (
                  <div
                    key={title}
                    className="rounded-[22px] border border-white/12 bg-white/8 p-4 shadow-[0_18px_36px_rgba(9,33,67,0.16)] backdrop-blur-sm"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-white shadow-[0_10px_22px_rgba(67,136,233,0.28)]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-extrabold text-white">{title}</p>
                        <p className="mt-1 text-sm leading-6 text-white/72">{description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

          <div className="bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(67,136,233,0.04)_100%)] px-4 py-5 sm:px-6 sm:py-8 lg:order-2 lg:px-8 lg:py-10">
            {isSubmitted ? (
              <div className="flex h-full flex-col justify-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-secondary/12 text-secondary shadow-[0_16px_30px_rgba(67,136,233,0.18)]">
                  <CheckCircle2 className="h-8 w-8" />
                </div>

                <h3 className="mt-5 text-2xl font-black text-primary sm:mt-6 sm:text-3xl">
                  {copy.successTitle}
                </h3>

                <p className="mt-3 max-w-md text-sm leading-7 text-third sm:text-base">
                  {copy.successDescription}
                </p>

                <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2">
                  <div className="rounded-[22px] border border-secondary/15 bg-secondary/8 px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-third">
                      {copy.contactPhoneLabel}
                    </p>
                    <p className="mt-2 text-base font-bold text-primary">
                      {SITE_CONFIG.contact.phone}
                    </p>
                  </div>
                  <div className="rounded-[22px] border border-secondary/15 bg-secondary/8 px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-third">
                      {copy.contactEmailLabel}
                    </p>
                    <p className="mt-2 text-base font-bold text-primary wrap-break-word">
                      {SITE_CONFIG.contact.email}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={closeModal}
                  className="mt-6 h-12 rounded-2xl bg-primary text-white hover:bg-primary2 sm:mt-8"
                >
                  {copy.done}
                </Button>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary sm:hidden">
                    {copy.eyebrow}
                  </p>
                  <h3 className="text-xl font-black text-primary sm:text-2xl lg:text-[2rem]">
                    {copy.formTitle}
                  </h3>
                  <p className="mt-3 max-w-lg text-sm leading-7 text-third sm:text-base">
                    {copy.formDescription}
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4 sm:mt-8">
                  <Input
                    label={copy.fields.fullName.label}
                    placeholder={copy.fields.fullName.placeholder}
                    autoComplete="name"
                    error={getErrorMessage(errors.fullName?.message)}
                    {...register("fullName")}
                  />

                  <Input
                    label={copy.fields.phone.label}
                    placeholder={copy.fields.phone.placeholder}
                    autoComplete="tel"
                    inputMode="tel"
                    dir="ltr"
                    lang="en"
                    className="text-right placeholder:text-right [direction:ltr] [unicode-bidi:plaintext]"
                    error={getErrorMessage(errors.phone?.message)}
                    {...register("phone")}
                  />

                  <Input
                    label={copy.fields.companyName.label}
                    placeholder={copy.fields.companyName.placeholder}
                    autoComplete="organization"
                    error={getErrorMessage(errors.companyName?.message)}
                    {...register("companyName")}
                  />

                  {submitError ? (
                    <div className="rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                      {submitError}
                    </div>
                  ) : null}

                  <div className="hidden rounded-[22px] border border-secondary/15 bg-secondary/8 px-4 py-4 text-sm text-center leading-6 text-primary lg:block">
                    {copy.footnote}
                  </div>

                  <div className="sticky bottom-0 z-10 -mx-4 mt-2 grid grid-cols-2 gap-3 border-t border-primary/10 bg-white/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-3 backdrop-blur-sm sm:static sm:mx-0 sm:mt-0 sm:flex sm:items-center sm:justify-between sm:border-t-0 sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="w-full rounded-2xl border border-primary/10 bg-white px-4 py-3 text-sm font-semibold text-third transition-colors hover:text-primary sm:w-auto sm:rounded-none sm:border-0 sm:bg-transparent sm:px-0 sm:py-0"
                    >
                      {tCommon("cancel")}
                    </button>

                    <Button
                      type="submit"
                      isLoading={mutation.isPending}
                      className="group h-12 w-full rounded-2xl bg-primary px-4 text-white shadow-[0_18px_30px_rgba(9,33,67,0.18)] hover:bg-primary2 sm:w-auto sm:px-6"
                    >
                      <span>{copy.submit}</span>
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180" />
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}