export type DebugFetchResult<T = unknown> = {
  ok: boolean;
  status: number;
  data: T;
  durationMs: number;
};

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
  const response = await fetch(url, options);
  const durationMs = Date.now() - start;
  const text = await response.text();

  let data: unknown;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (isSearchDebugEnabled()) {
    console.log('\n==============================');
    console.log(`FETCH DEBUG: ${name}`);
    console.log('URL:', url);
    console.log('METHOD:', options.method || 'GET');
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
}