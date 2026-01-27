"use client";

import { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getQueryClient } from "@/lib/query-client";
import { CartProvider } from "@/hooks/use-cart";
import { WishlistProvider } from "@/hooks/use-wishlist";
import { AuthModalProvider } from "@/contexts/auth-modal-context";
import { GlobalLoaderProvider } from "@/components/ui/global-loader";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalLoaderProvider>
        <CartProvider>
          <AuthModalProvider>
            <WishlistProvider>
              {children}
            </WishlistProvider>
          </AuthModalProvider>
        </CartProvider>
      </GlobalLoaderProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
