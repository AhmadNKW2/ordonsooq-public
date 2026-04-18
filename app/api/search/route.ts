import { NextRequest, NextResponse } from 'next/server';

import { serverSearchWithSource } from '@/lib/search/api';
import type { SearchFilters } from '@/lib/search/types';

function parseOptionalNumber(value: string | null): number | undefined {
  if (!value) return undefined;

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : undefined;
}

function parseOptionalBoolean(value: string | null): boolean | undefined {
  if (value === 'true') return true;
  if (value === 'false') return false;

  return undefined;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const debug = searchParams.get('debug') === '1';
  const locale = searchParams.get('locale') ?? request.headers.get('x-search-locale') ?? 'en';

  const filters: SearchFilters = {
    q: searchParams.get('q') ?? undefined,
    category_ids: searchParams.get('category_ids') ?? undefined,
    brand_ids: searchParams.get('brand_ids') ?? searchParams.get('brand_id') ?? undefined,
    vendor_ids: searchParams.get('vendor_ids') ?? searchParams.get('vendor_id') ?? undefined,
    attributes_values_ids: searchParams.get('attributes_values_ids') ?? undefined,
    specifications_values_ids: searchParams.get('specifications_values_ids') ?? undefined,
    min_price: parseOptionalNumber(searchParams.get('min_price')),
    max_price: parseOptionalNumber(searchParams.get('max_price')),
    is_out_of_stock: parseOptionalBoolean(searchParams.get('is_out_of_stock')),
    average_rating_min: parseOptionalNumber(searchParams.get('average_rating_min')),
    sort_by: (searchParams.get('sort_by') as SearchFilters['sort_by']) ?? undefined,
    page: parseOptionalNumber(searchParams.get('page')),
    per_page: parseOptionalNumber(searchParams.get('per_page')),
  };

  try {
    const result = await serverSearchWithSource(filters, request.signal, locale);
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