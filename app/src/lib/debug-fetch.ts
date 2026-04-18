export type DebugFetchResult<T = unknown> = {
  ok: boolean;
  status: number;
  data: T;
  durationMs: number;
};

import {
  createApiLogEntry,
  parseApiBodyText,
  sendApiLogEntry,
  serializeRequestBody,
  toApiLogError,
} from "@/lib/api-request-log";

export function isSearchDebugEnabled(): boolean {
  return process.env.NEXT_PUBLIC_SEARCH_DEBUG === '1';
}

export function logSearchDebug(name: string, payload: Record<string, unknown>) {
  if (!isSearchDebugEnabled()) return;

  console.log('\n==============================');
  console.log(`SEARCH DEBUG: ${name}`);

  for (const [key, value] of Object.entries(payload)) {
    console.log(`${key}:`, value);
  }

  console.log('==============================\n');
}

export async function debugFetch<T = unknown>(
  name: string,
  url: string,
  options: RequestInit = {}
): Promise<DebugFetchResult<T>> {
  const start = Date.now();
  const startedAt = new Date();

  try {
    const response = await fetch(url, options);
    const durationMs = Date.now() - start;
    const text = await response.text();
    const parsedBody = parseApiBodyText(text, response.headers.get('content-type'));
    const data = parsedBody.value;

    const entry = createApiLogEntry({
      timestamp: startedAt,
      source: "debug-fetch",
      label: name,
      durationMs,
      request: {
        method: options.method || 'GET',
        url,
        headers: options.headers,
        body: serializeRequestBody(options.body),
        credentials: options.credentials,
        cache: options.cache,
        mode: options.mode,
        redirect: options.redirect,
        referrer: options.referrer,
        integrity: options.integrity,
        keepalive: options.keepalive,
      },
      response: {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        body: data,
      },
      notes: parsedBody.jsonError ? ["Response body could not be parsed as JSON."] : undefined,
    });

    await sendApiLogEntry(entry).catch(() => undefined);

    if (isSearchDebugEnabled()) {
      console.log('\n==============================');
      console.log(`FETCH DEBUG: ${name}`);
      console.log('URL:', url);
      console.log('METHOD:', options.method || 'GET');
      console.log('REQUEST BODY:', serializeRequestBody(options.body));
      console.log('STATUS:', response.status);
      console.log('TIME:', `${durationMs}ms`);
      console.log('RESPONSE:', data);
      console.log('==============================\n');
    }

    return {
      ok: response.ok,
      status: response.status,
      data: data as T,
      durationMs,
    };
  } catch (error) {
    const entry = createApiLogEntry({
      timestamp: startedAt,
      source: "debug-fetch",
      label: name,
      durationMs: Date.now() - start,
      request: {
        method: options.method || 'GET',
        url,
        headers: options.headers,
        body: serializeRequestBody(options.body),
        credentials: options.credentials,
        cache: options.cache,
        mode: options.mode,
        redirect: options.redirect,
        referrer: options.referrer,
        integrity: options.integrity,
        keepalive: options.keepalive,
      },
      error: toApiLogError(error),
    });

    await sendApiLogEntry(entry).catch(() => undefined);
    throw error;
  }
}