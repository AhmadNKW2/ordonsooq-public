import { NextRequest, NextResponse } from 'next/server';

import { serverAutocompleteWithSource } from '@/lib/search/api';

function parsePerPage(value: string | null): number {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : 8;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q')?.trim() ?? '';
  const perPage = parsePerPage(searchParams.get('per_page'));

  try {
    const { data, source } = await serverAutocompleteWithSource(query, perPage);
    return NextResponse.json(data, {
      headers: {
        'x-search-upstream': source,
      },
    });
  } catch {
    return NextResponse.json({ message: 'Autocomplete failed' }, { status: 500 });
  }
}