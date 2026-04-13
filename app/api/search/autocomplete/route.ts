import { NextRequest, NextResponse } from 'next/server';

import { serverAutocompleteWithSource } from '@/lib/search/api';

function parsePerPage(value: string | null): number {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : 8;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const debug = searchParams.get('debug') === '1';
  const query = searchParams.get('q')?.trim() ?? '';
  const perPage = parsePerPage(searchParams.get('per_page'));

  try {
    const result = await serverAutocompleteWithSource(query, perPage, request.signal);
    const headers = {
      'x-search-upstream': result.source,
      'x-search-status': String(result.status),
      'x-search-duration-ms': String(result.durationMs),
    };

    if (debug) {
      return NextResponse.json({
        source: result.source,
        status: result.status,
        durationMs: result.durationMs,
        raw: result.rawData,
        final: result.data,
      }, {
        headers,
      });
    }

    return NextResponse.json(result.data, {
      headers: {
        ...headers,
      },
    });
  } catch {
    return NextResponse.json({ message: 'Autocomplete failed' }, { status: 500 });
  }
}