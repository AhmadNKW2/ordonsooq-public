import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getScopedMessages } from "./scoped-messages";
import type { Locale, MessageNamespace } from "./message-catalog";

interface RouteIntlProviderProps {
  locale: Locale;
  namespaces: readonly MessageNamespace[];
  children: ReactNode;
}

export function RouteIntlProvider({ locale, namespaces, children }: RouteIntlProviderProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={getScopedMessages(locale, namespaces)}>
      {children}
    </NextIntlClientProvider>
  );
}