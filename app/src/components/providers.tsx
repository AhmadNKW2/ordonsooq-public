"use client";

import dynamic from "next/dynamic";
import { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { getQueryClient } from "@/lib/query-client";
import { CartProvider } from "@/hooks/use-cart";
import { WishlistProvider } from "@/hooks/use-wishlist";
import { AuthModalProvider } from "@/contexts/auth-modal-context";
import { GlobalLoaderProvider } from "@/components/ui/global-loader";

const ReactQueryDevtools = dynamic(
  () => import("@tanstack/react-query-devtools").then((module) => module.ReactQueryDevtools),
  { ssr: false },
);

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const queryClient = getQueryClient();
  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        <GlobalLoaderProvider>
          <CartProvider>
            <AuthModalProvider>
              <WishlistProvider>
                {children}
              </WishlistProvider>
            </AuthModalProvider>
          </CartProvider>
        </GlobalLoaderProvider>
      </NuqsAdapter>
      {isDevelopment ? <ReactQueryDevtools initialIsOpen={false} /> : null}
    </QueryClientProvider>
  );
}
