import type { AbstractIntlMessages } from "next-intl";
import { messageCatalog, type Locale, type MessageNamespace } from "./message-catalog";

function uniqueNamespaces(namespaces: readonly MessageNamespace[]) {
  return Array.from(new Set(namespaces));
}

export function getScopedMessages(
  locale: Locale,
  namespaces: readonly MessageNamespace[],
): AbstractIntlMessages {
  const localeMessages = messageCatalog[locale];
  const scopedMessages: AbstractIntlMessages = {};

  uniqueNamespaces(namespaces).forEach((namespace) => {
    const namespaceMessages = localeMessages[namespace];

    if (namespaceMessages !== undefined) {
      scopedMessages[namespace] = namespaceMessages;
    }
  });

  return scopedMessages;
}

export const ROOT_MESSAGE_NAMESPACES = [
  "common",
  "nav",
  "navigation",
  "topBar",
  "auth",
  "cart",
  "footer",
  "features",
] satisfies readonly MessageNamespace[];

export const HOME_MESSAGE_NAMESPACES = [
  "common",
  "home",
  "features",
  "newsletter",
  "product",
  "productGrid",
] satisfies readonly MessageNamespace[];

export const LISTING_MESSAGE_NAMESPACES = [
  "common",
  "nav",
  "product",
  "productGrid",
  "options",
] satisfies readonly MessageNamespace[];

export const PRODUCT_DETAIL_MESSAGE_NAMESPACES = [
  "common",
  "nav",
  "product",
  "productGrid",
] satisfies readonly MessageNamespace[];

export const SEARCH_MESSAGE_NAMESPACES = [
  "common",
  "nav",
  "product",
  "search",
  "options",
] satisfies readonly MessageNamespace[];

export const CHECKOUT_MESSAGE_NAMESPACES = [
  "common",
  "checkout",
  "profile",
] satisfies readonly MessageNamespace[];

export const PROFILE_LAYOUT_MESSAGE_NAMESPACES = [
  "common",
  "nav",
  "auth",
  "profile",
] satisfies readonly MessageNamespace[];

export const PROFILE_WISHLIST_MESSAGE_NAMESPACES = [
  "common",
  "wishlist",
  "product",
  "productGrid",
] satisfies readonly MessageNamespace[];