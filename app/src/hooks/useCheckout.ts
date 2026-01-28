"use client";

import { useAuth } from "./useAuth";
import { useAuthModal } from "@/contexts/auth-modal-context";
import { useRouter, usePathname } from "@/i18n/navigation";

export function useCheckout() {
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();
  const router = useRouter();
  const pathname = usePathname();

  const handleCheckout = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!user) {
      openAuthModal("login");
      return;
    }

    if (pathname === '/checkout') {
      return;
    }

    router.push("/checkout");
  };

  return { handleCheckout };
}
