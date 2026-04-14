import { getLocale } from "next-intl/server";
import { ProfileSidebar } from "@/components/profile/profile-sidebar";
import type { Locale } from "@/i18n/message-catalog";
import { RouteIntlProvider } from "@/i18n/route-intl-provider";
import { PROFILE_LAYOUT_MESSAGE_NAMESPACES } from "@/i18n/scoped-messages";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = (await getLocale()) as Locale;

  return (
    <RouteIntlProvider locale={locale} namespaces={PROFILE_LAYOUT_MESSAGE_NAMESPACES}>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-64 shrink-0">
              <ProfileSidebar />
            </aside>
            <main className="flex-1 min-w-0">
              {children}
            </main>
          </div>
        </div>
      </div>
    </RouteIntlProvider>
  );
}
