'use client';

import { useTranslations } from 'next-intl';

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number | null) => void;
}

export function Pagination({ page, totalPages, onPageChange }: Props) {
  const t = useTranslations('search');
  const pages = buildPageRange(page, totalPages);

  return (
    <nav className="flex items-center justify-center gap-1 mt-10">
      <PageButton
        label={t('prevPage')}
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      />

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-3 py-2 text-gray-400">…</span>
        ) : (
          <PageButton
            key={p}
            label={String(p)}
            active={p === page}
            onClick={() => onPageChange(p as number)}
          />
        )
      )}

      <PageButton
        label={t('nextPage')}
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      />
    </nav>
  );
}

function PageButton({
  label,
  onClick,
  disabled = false,
  active = false,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-primary text-white'
          : disabled
          ? 'text-gray-300 cursor-not-allowed'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );
}

function buildPageRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
}
