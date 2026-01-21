"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type User } from "@/types";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { apiClient, ApiError } from "@/lib/api-client";

const AUTH_KEYS = {
  user: ["auth", "user"],
};

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    const handler = () => {
      queryClient.setQueryData(AUTH_KEYS.user, null);
    };

    window.addEventListener("auth:logout", handler as EventListener);
    return () => window.removeEventListener("auth:logout", handler as EventListener);
  }, [queryClient]);

  // Query to get current user profile
  const { 
    data: user, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: AUTH_KEYS.user,
    queryFn: async () => {
        // Don't fetch profile if we don't have a token (guest user)
        if (!apiClient.getAccessToken()) return null;

        try {
            return await authService.getProfile();
        } catch(e) {
            // Cookie-based auth: 401/403 simply means "not logged in".
            // Don't treat it as a hard error and don't clear anything client-side.
            if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
              return null;
            }

            // Other errors (network/5xx) shouldn't force logout.
            return null;
        }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (response) => {
      // Backend sets HttpOnly cookies; just refetch profile.
      // If backend also returns the user in body, this still works.
      const anyResponse = response as any;
      const nextUser = anyResponse?.data?.user || anyResponse?.user;
      
      // Store token if available
      const token = anyResponse?.data?.access_token || anyResponse?.access_token;
      if (token) apiClient.setAccessToken(token);

      if (nextUser) {
        queryClient.setQueryData(AUTH_KEYS.user, nextUser);
      } else {
        // Only invalidate if we didn't get the user from the login response
        queryClient.invalidateQueries({ queryKey: AUTH_KEYS.user });
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (response) => {
      const anyResponse = response as any;
      const nextUser = anyResponse?.data?.user || anyResponse?.user;

      // Store token if available
      const token = anyResponse?.data?.access_token || anyResponse?.access_token;
      if (token) apiClient.setAccessToken(token);

      if (nextUser) {
        queryClient.setQueryData(AUTH_KEYS.user, nextUser);
      } else {
        queryClient.invalidateQueries({ queryKey: AUTH_KEYS.user });
      }
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      apiClient.clearAccessToken();
      queryClient.setQueryData(AUTH_KEYS.user, null);
      queryClient.invalidateQueries(); // Invalidate all queries on logout to clear sensitive data
      router.push("/");
    },
  });

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}
