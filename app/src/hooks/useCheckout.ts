"use client";

import { useAuth } from "./useAuth";
import { useAuthModal } from "@/contexts/auth-modal-context";
import { useRouter } from "@/i18n/navigation";

export function useCheckout() {
  const { data: user } = useAuth();
  const { openAuthModal } = useAuthModal();
  const router = useRouter();

  const handleCheckout = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!user) {
      openAuthModal("login");
      return;
    }

    router.push("/checkout");
  };

  return { handleCheckout };
}
