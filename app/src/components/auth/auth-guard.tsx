"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "@/i18n/navigation";

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Redirects unauthenticated users to /login.
 * Used as a client-side safety net on protected pages (profile, checkout, etc.)
 * in case the middleware cookie check passes but the session is actually gone.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  // Show nothing while loading or redirecting
  if (isLoading || !user) return null;

  return <>{children}</>;
}
