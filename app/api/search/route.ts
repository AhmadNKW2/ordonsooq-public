import { NextRequest, NextResponse } from 'next/server';

import { serverSearchWithSource } from '@/lib/search/api';
import type { SearchFilters } from '@/lib/search/types';

function parseOptionalNumber(value: string | null): number | undefined {
  if (!value) return undefined;

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : undefined;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const debug = searchParams.get('debug') === '1';
  const attrs = searchParams.getAll('attrs').map((value) => value.trim()).filter(Boolean);

  const filters: SearchFilters = {
    q: searchParams.get('q') ?? undefined,
    category_ids: searchParams.get('category_ids') ?? undefined,
    category: searchParams.get('category') ?? undefined,
    subcategory: searchParams.get('subcategory') ?? undefined,
    brand_id: searchParams.get('brand_id') ?? undefined,
    brand: searchParams.get('brand') ?? undefined,
    vendor_id: searchParams.get('vendor_id') ?? undefined,
    attrs: attrs.length > 0 ? attrs : undefined,
    min_price: parseOptionalNumber(searchParams.get('min_price')),
    max_price: parseOptionalNumber(searchParams.get('max_price')),
    sort_by: (searchParams.get('sort_by') as SearchFilters['sort_by']) ?? undefined,
    page: parseOptionalNumber(searchParams.get('page')),
    per_page: parseOptionalNumber(searchParams.get('per_page')),
  };

  try {
    const result = await serverSearchWithSource(filters, request.signal);
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
    return NextResponse.json({ message: 'Search failed' }, { status: 500 });
  }
}