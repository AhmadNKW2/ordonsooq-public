type ApiClientConfig = {
  baseUrl?: string;
  headers?: HeadersInit;
};

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(status: number, message: string, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;
  private refreshInFlight: Promise<boolean> | null = null;
  private hardLogoutTriggered = false;
  private accessToken: string | null = null;

  constructor(config?: ApiClientConfig) {
    this.baseUrl = config?.baseUrl || process.env.NEXT_PUBLIC_API_URL || '';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config?.headers,
    };
    
    // Attempt to hydrate token from localStorage if available
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('access_token');
      if (stored) this.accessToken = stored;
    }
  }

  public setAccessToken(token: string) {
    this.accessToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  public clearAccessToken() {
    this.accessToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  }

  private async refreshSession(): Promise<boolean> {
    if (this.refreshInFlight) return this.refreshInFlight;

    this.refreshInFlight = (async () => {
      try {
        const response = await fetch(`${this.baseUrl}/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: {
            ...this.defaultHeaders,
            ...(this.accessToken ? { 'Authorization': `Bearer ${this.accessToken}` } : {}),
          },
        });

        if (!response.ok) return false;

        // Try to parse the new token from valid JSON response
        const data = await response.json().catch(() => null);
        const newToken = data?.data?.access_token || data?.access_token;
        
        if (newToken) {
          this.setAccessToken(newToken);
        }

        return true;
      } catch {
        return false;
      } finally {
        this.refreshInFlight = null;
      }
    })();

    return this.refreshInFlight;
  }

  private handleHardLogout() {
    if (typeof window === "undefined") return;
    if (this.hardLogoutTriggered) return;
    this.hardLogoutTriggered = true;

    window.dispatchEvent(new CustomEvent("auth:logout"));

    // Avoid redirect loops if already on login.
    // const path = window.location?.pathname || "";
    // if (!path.includes("/login")) {
    //   // Locale-aware login route (app has /[locale]/login)
    //   const firstSeg = path.split("/").filter(Boolean)[0];
    //   const localePrefix = firstSeg && firstSeg.length === 2 ? `/${firstSeg}` : "";
    //   window.location.assign(`${localePrefix}/login`);
    // }
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit,
    meta?: { hasRetriedAfterRefresh?: boolean }
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      ...options,
      // Backend uses HttpOnly cookies (access_token/refresh_token)
      // so requests must include credentials for cookies to be sent/stored.
      credentials: "include",
      headers: {
        ...this.defaultHeaders,
        ...(this.accessToken ? { 'Authorization': `Bearer ${this.accessToken}` } : {}),
        ...options?.headers,
      },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      // If access token expired, try refresh once and retry the original request.
      const shouldAttemptRefresh =
        response.status === 401 &&
        !meta?.hasRetriedAfterRefresh &&
        // Don't recurse on auth endpoints.
        !endpoint.startsWith("/auth/login") &&
        !endpoint.startsWith("/auth/register") &&
        !endpoint.startsWith("/auth/refresh") &&
        !endpoint.startsWith("/auth/logout");

      if (shouldAttemptRefresh) {
        const refreshed = await this.refreshSession();
        if (refreshed) {
          return this.request<T>(endpoint, options, { hasRetriedAfterRefresh: true });
        }

        // Refresh failed => session is dead.
        this.handleHardLogout();
      }

      const payload = await response.json().catch(() => ({}));
      const message =
        (payload && typeof payload === "object" &&
          (((payload as any).message as string | undefined) ||
            ((payload as any).error?.message as string | undefined))) ||
        `HTTP Error: ${response.status}`;

      throw new ApiError(response.status, String(message), payload);
    }

    // Handle empty responses (204 No Content)
    const contentType = response.headers.get('content-type');
    if (response.status === 204 || !contentType?.includes('application/json')) {
      return {} as T;
    }

    const jsonResponse = await response.json();
    
    // Unwrap the response if it has a 'data' property BUT NOT 'meta' (common API pattern)
    // If it has both 'data' and 'meta', keep the structure for pagination
    if (jsonResponse && typeof jsonResponse === 'object' && 'data' in jsonResponse && !('meta' in jsonResponse)) {
      return jsonResponse.data as T;
    }

    return jsonResponse;
  }

  get<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, data?: unknown, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put<T>(endpoint: string, data?: unknown, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  patch<T>(endpoint: string, data?: unknown, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  delete<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
