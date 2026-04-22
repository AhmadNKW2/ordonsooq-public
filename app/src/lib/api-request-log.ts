const API_REQUEST_LOG_INGEST_PATH = "/api/internal/request-logs";
export const API_REQUEST_LOG_INGEST_HEADER_NAME = "x-ordonsooq-api-log";
export const API_REQUEST_LOG_INGEST_HEADER_VALUE = "1";
const MAX_API_LOG_STRING_LENGTH = 2_000;
const MAX_API_LOG_ARRAY_ITEMS = 20;
const MAX_API_LOG_OBJECT_ENTRIES = 30;
const MAX_API_LOG_DEPTH = 4;

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

function isEnabledFlag(value?: string): boolean {
  if (!value) {
    return false;
  }

  const normalizedValue = value.trim().toLowerCase();
  return normalizedValue === "1" || normalizedValue === "true" || normalizedValue === "yes" || normalizedValue === "on";
}

function summarizeApiLogString(value: string): string {
  if (value.length <= MAX_API_LOG_STRING_LENGTH) {
    return value;
  }

  const truncatedCharacters = value.length - MAX_API_LOG_STRING_LENGTH;
  return `${value.slice(0, MAX_API_LOG_STRING_LENGTH)}... <truncated ${truncatedCharacters} chars>`;
}

export function summarizeApiLogValue(value: unknown, depth = 0): unknown {
  if (value == null || typeof value === "boolean" || typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    return summarizeApiLogString(value);
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    const items = value
      .slice(0, MAX_API_LOG_ARRAY_ITEMS)
      .map((item) => summarizeApiLogValue(item, depth + 1));

    if (value.length > MAX_API_LOG_ARRAY_ITEMS) {
      items.push({ __truncatedItems: value.length - MAX_API_LOG_ARRAY_ITEMS });
    }

    return items;
  }

  if (typeof value === "object") {
    if (depth >= MAX_API_LOG_DEPTH) {
      return {
        __type: Object.prototype.toString.call(value),
        __truncated: true,
      };
    }

    const entries = Object.entries(value as Record<string, unknown>);
    const limitedEntries = entries
      .slice(0, MAX_API_LOG_OBJECT_ENTRIES)
      .map(([key, entryValue]) => [key, summarizeApiLogValue(entryValue, depth + 1)]);
    const summarized: Record<string, unknown> = Object.fromEntries(limitedEntries);

    if (entries.length > MAX_API_LOG_OBJECT_ENTRIES) {
      summarized.__truncatedKeys = entries.length - MAX_API_LOG_OBJECT_ENTRIES;
    }

    return summarized;
  }

  return String(value);
}

export function isApiRequestLoggingEnabled(): boolean {
  return process.env.NODE_ENV === "development" && (
    isEnabledFlag(process.env.NEXT_PUBLIC_ENABLE_API_REQUEST_LOGGING) ||
    (typeof window === "undefined" && isEnabledFlag(process.env.ENABLE_API_REQUEST_LOGGING))
  );
}

export function isServerApiRequestLoggingEnabled(): boolean {
  return process.env.NODE_ENV === "development" && typeof window === "undefined" && (
    isEnabledFlag(process.env.ENABLE_API_REQUEST_LOGGING) ||
    isEnabledFlag(process.env.NEXT_PUBLIC_ENABLE_API_REQUEST_LOGGING)
  );
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

function normalizeUrlPathname(value: string): string | null {
  try {
    return new URL(value, "http://localhost").pathname;
  } catch {
    return null;
  }
}

export function isApiLogIngestUrl(value: string): boolean {
  return normalizeUrlPathname(value) === API_REQUEST_LOG_INGEST_PATH;
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
  const shouldPreserveFullBody = typeof window === "undefined";

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
      body: shouldPreserveFullBody ? input.request.body : summarizeApiLogValue(input.request.body),
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
          body: shouldPreserveFullBody ? input.response.body : summarizeApiLogValue(input.response.body),
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

  if (typeof window === "undefined") {
    const { writeApiLogEntryToFile } = await import("@/lib/api-request-log-server");
    await writeApiLogEntryToFile(entry);
    return;
  }

  if (isApiLogIngestUrl(entry.request.url)) {
    return;
  }

  const body = JSON.stringify(entry);
  const ingestUrl = getApiLogIngestUrl();

  await fetch(ingestUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      [API_REQUEST_LOG_INGEST_HEADER_NAME]: API_REQUEST_LOG_INGEST_HEADER_VALUE,
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

  if (typeof window === "undefined") {
    const { resetApiLogEntriesFile } = await import("@/lib/api-request-log-server");
    await resetApiLogEntriesFile();
    return;
  }

  const body = JSON.stringify(createApiLogResetPayload());
  const ingestUrl = getApiLogIngestUrl();

  await fetch(ingestUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      [API_REQUEST_LOG_INGEST_HEADER_NAME]: API_REQUEST_LOG_INGEST_HEADER_VALUE,
    },
    body,
    cache: "no-store",
    keepalive: true,
  });
}

export function stringifyApiLogEntries(entries: ApiLogEntry[]): string {
  return `${JSON.stringify(entries, null, 2)}\n`;
}