import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { Figtree, Almarai } from "next/font/google";
import { setRequestLocale } from "next-intl/server";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Providers } from "@/components/providers";
import type { Locale } from "@/i18n/message-catalog";
import { RouteIntlProvider } from "@/i18n/route-intl-provider";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { SITE_CONFIG } from "@/lib/constants";
import { getQueryClient } from "@/lib/query-client";
import { routing } from "@/i18n/routing";
import { ROOT_MESSAGE_NAMESPACES } from "@/i18n/scoped-messages";
import { homeKeys } from "@/hooks/useHome";
import { homeService } from "@/services/home.service";
import { Analytics } from "@vercel/analytics/next";
import "./../globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-figtree",
});

const almarai = Almarai({
  subsets: ["arabic"],
  weight: ["300", "400", "700", "800"],
  display: "swap",
  variable: "--font-almarai",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: {
    default: SITE_CONFIG.name,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: ["e-commerce", "online shopping", "ordonsooq", "shop", "buy"],
  authors: [{ name: "ordonsooq Team" }],
  creator: "ordonsooq",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_CONFIG.url,
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    siteName: SITE_CONFIG.name,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    creator: "@ordonsooq",
  },
  robots: {
    index: true,
    follow: true,
  },
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params;
  const queryClient = getQueryClient();

  setRequestLocale(locale);

  await queryClient.prefetchQuery({
    queryKey: homeKeys.data(),
    queryFn: () => homeService.getHomeData(),
  }).catch(() => undefined);

  const isRTL = locale === 'ar';
  const resolvedLocale = locale as Locale;
  const dehydratedState = dehydrate(queryClient);

  return (
    <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'} className={`${figtree.variable} ${almarai.variable}`}>
      <body className={`${isRTL ? almarai.className : figtree.className} antialiased min-h-screen flex flex-col bg-gray-50/50`}>
        <RouteIntlProvider locale={resolvedLocale} namespaces={ROOT_MESSAGE_NAMESPACES}>
          <Providers>
            <HydrationBoundary state={dehydratedState}>
              <Header />
              <main className="flex-1">
                <PageWrapper>
                  {children}
                </PageWrapper>
              </main>
              <Footer />
            </HydrationBoundary>
          </Providers>
        </RouteIntlProvider>
        <Analytics />
      </body>
    </html>
  );
}
