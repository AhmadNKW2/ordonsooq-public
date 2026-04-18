const API_REQUEST_LOG_INGEST_PATH = "/api/internal/request-logs";

type ApiLogResetPayload = {
  type: "reset";
};

export type ApiLogError = {
  name: string;
  message: string;
  stack?: string;
};

export type ApiLogEntry = {
  id: string;
  timestampIso: string;
  timestampLocal: string;
  runtime: "server" | "client";
  source: string;
  label: string;
  durationMs: number;
  request: {
    method: string;
    url: string;
    headers?: Record<string, string>;
    body?: unknown;
    credentials?: RequestCredentials;
    cache?: RequestCache;
    mode?: RequestMode;
    redirect?: RequestRedirect;
    referrer?: string;
    integrity?: string;
    keepalive?: boolean;
  };
  response?: {
    ok: boolean;
    status: number;
    statusText: string;
    headers?: Record<string, string>;
    body?: unknown;
  };
  error?: ApiLogError;
  notes?: string[];
};

type ApiLogEntryInput = {
  timestamp?: Date;
  source: string;
  label: string;
  durationMs: number;
  request: {
    method?: string;
    url: string;
    headers?: HeadersInit;
    body?: unknown;
    credentials?: RequestCredentials;
    cache?: RequestCache;
    mode?: RequestMode;
    redirect?: RequestRedirect;
    referrer?: string;
    integrity?: string;
    keepalive?: boolean;
  };
  response?: {
    ok: boolean;
    status: number;
    statusText: string;
    headers?: HeadersInit;
    body?: unknown;
  };
  error?: ApiLogError;
  notes?: string[];
};

export type ParsedApiBody = {
  value: unknown;
  jsonError?: string;
};

export function isApiRequestLoggingEnabled(): boolean {
  return process.env.NODE_ENV === "development";
}

function createLogId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function withTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

function resolveServerBaseUrl(): string {
  const configuredBaseUrl = [
    process.env.API_LOG_BASE_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.APP_URL,
    process.env.SITE_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  ]
    .map((value) => value?.trim())
    .find(Boolean);

  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  return `http://127.0.0.1:${process.env.PORT || "3000"}`;
}

export function getApiLogIngestUrl(): string {
  if (typeof window !== "undefined") {
    return API_REQUEST_LOG_INGEST_PATH;
  }

  return new URL(API_REQUEST_LOG_INGEST_PATH.replace(/^\//, ""), withTrailingSlash(resolveServerBaseUrl())).toString();
}

function looksLikeJson(value: string): boolean {
  const trimmed = value.trim();

  if (!trimmed) return false;

  const firstCharacter = trimmed[0];
  return (
    firstCharacter === "{" ||
    firstCharacter === "[" ||
    firstCharacter === '"' ||
    firstCharacter === "-" ||
    (firstCharacter >= "0" && firstCharacter <= "9") ||
    trimmed === "true" ||
    trimmed === "false" ||
    trimmed === "null"
  );
}

function appendHeader(target: Record<string, string>, key: string, value: string) {
  const normalizedKey = key.toLowerCase();

  if (normalizedKey in target) {
    target[normalizedKey] = `${target[normalizedKey]}, ${value}`;
    return;
  }

  target[normalizedKey] = value;
}

export function normalizeHeaders(headers?: HeadersInit): Record<string, string> | undefined {
  if (!headers) return undefined;

  const normalized: Record<string, string> = {};

  if (headers instanceof Headers) {
    headers.forEach((value, key) => {
      appendHeader(normalized, key, value);
    });
  } else if (Array.isArray(headers)) {
    headers.forEach(([key, value]) => {
      appendHeader(normalized, key, String(value));
    });
  } else {
    Object.entries(headers).forEach(([key, value]) => {
      if (value == null) return;

      appendHeader(normalized, key, Array.isArray(value) ? value.join(", ") : String(value));
    });
  }

  const entries = Object.entries(normalized).sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey));
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

function serializeFormData(formData: FormData): Record<string, unknown> {
  const values = new Map<string, Array<string | { name: string; size: number; type: string }>>();

  formData.forEach((value, key) => {
    const serializedValue =
      typeof File !== "undefined" && value instanceof File
        ? { name: value.name, size: value.size, type: value.type }
        : String(value);

    const existingValues = values.get(key) ?? [];
    existingValues.push(serializedValue);
    values.set(key, existingValues);
  });

  return Object.fromEntries(
    Array.from(values.entries()).map(([key, items]) => [key, items.length === 1 ? items[0] : items])
  );
}

export function serializeRequestBody(body?: BodyInit | null): unknown {
  if (body == null) return null;

  if (typeof body === "string") {
    return parseApiBodyText(body, "application/json").value;
  }

  if (body instanceof URLSearchParams) {
    return Object.fromEntries(body.entries());
  }

  if (typeof FormData !== "undefined" && body instanceof FormData) {
    return serializeFormData(body);
  }

  if (typeof Blob !== "undefined" && body instanceof Blob) {
    return {
      type: body.type || "application/octet-stream",
      size: body.size,
    };
  }

  if (body instanceof ArrayBuffer) {
    return `[ArrayBuffer ${body.byteLength} bytes]`;
  }

  if (ArrayBuffer.isView(body)) {
    return `[Binary ${body.byteLength} bytes]`;
  }

  if (typeof ReadableStream !== "undefined" && body instanceof ReadableStream) {
    return "[ReadableStream]";
  }

  return String(body);
}

export function parseApiBodyText(rawText: string, contentType?: string | null): ParsedApiBody {
  if (!rawText.trim()) {
    return { value: null };
  }

  const normalizedContentType = contentType?.toLowerCase() ?? "";
  const shouldTryJson = normalizedContentType.includes("json") || looksLikeJson(rawText);

  if (!shouldTryJson) {
    return { value: rawText };
  }

  try {
    return { value: JSON.parse(rawText) };
  } catch (error) {
    return {
      value: rawText,
      jsonError: error instanceof Error ? error.message : "Failed to parse JSON body.",
    };
  }
}

export function toApiLogError(error: unknown): ApiLogError {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    name: "UnknownError",
    message: typeof error === "string" ? error : JSON.stringify(error),
  };
}

export function createApiLogEntry(input: ApiLogEntryInput): ApiLogEntry {
  const timestamp = input.timestamp ?? new Date();

  return {
    id: createLogId(),
    timestampIso: timestamp.toISOString(),
    timestampLocal: timestamp.toString(),
    runtime: typeof window === "undefined" ? "server" : "client",
    source: input.source,
    label: input.label,
    durationMs: input.durationMs,
    request: {
      method: input.request.method || "GET",
      url: input.request.url,
      headers: normalizeHeaders(input.request.headers),
      body: input.request.body,
      credentials: input.request.credentials,
      cache: input.request.cache,
      mode: input.request.mode,
      redirect: input.request.redirect,
      referrer: input.request.referrer,
      integrity: input.request.integrity,
      keepalive: input.request.keepalive,
    },
    response: input.response
      ? {
          ok: input.response.ok,
          status: input.response.status,
          statusText: input.response.statusText,
          headers: normalizeHeaders(input.response.headers),
          body: input.response.body,
        }
      : undefined,
    error: input.error,
    notes: input.notes,
  };
}

function createApiLogResetPayload(): ApiLogResetPayload {
  return { type: "reset" };
}

export async function sendApiLogEntry(entry: ApiLogEntry): Promise<void> {
  if (!isApiRequestLoggingEnabled()) {
    return;
  }

  const body = JSON.stringify(entry);
  const ingestUrl = getApiLogIngestUrl();

  if (typeof window !== "undefined" && typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const payload = new Blob([body], { type: "application/json" });

    if (navigator.sendBeacon(ingestUrl, payload)) {
      return;
    }
  }

  await fetch(ingestUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
    cache: "no-store",
    keepalive: true,
  });
}

export async function sendApiLogReset(): Promise<void> {
  if (!isApiRequestLoggingEnabled()) {
    return;
  }

  const body = JSON.stringify(createApiLogResetPayload());
  const ingestUrl = getApiLogIngestUrl();

  if (typeof window !== "undefined" && typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const payload = new Blob([body], { type: "application/json" });

    if (navigator.sendBeacon(ingestUrl, payload)) {
      return;
    }
  }

  await fetch(ingestUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
    cache: "no-store",
    keepalive: true,
  });
}

export function stringifyApiLogEntries(entries: ApiLogEntry[]): string {
  return `${JSON.stringify(entries, null, 2)}\n`;
}