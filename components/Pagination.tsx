'use client';

import { ChevronLeftIcon, ChevronRightIcon } from '@/components/Icons';

interface Props {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPage: (p: number) => void;
  itemLabel?: string; // e.g. "patient" → "Showing 1–20 of 47 patients"
}

function pageNumbers(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '…')[] = [];
  if (current <= 4) {
    pages.push(1, 2, 3, 4, 5, '…', total);
  } else if (current >= total - 3) {
    pages.push(1, '…', total - 4, total - 3, total - 2, total - 1, total);
  } else {
    pages.push(1, '…', current - 1, current, current + 1, '…', total);
  }
  return pages;
}

export function Pagination({ page, totalPages, totalItems, pageSize, onPage, itemLabel = 'record' }: Props) {
  if (totalPages <= 1 && totalItems <= pageSize) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);
  const plural = totalItems !== 1 ? `${itemLabel}s` : itemLabel;
  const nums = pageNumbers(page, totalPages);

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex-wrap">
      {/* Range label */}
      <span className="text-xs text-slate-500 whitespace-nowrap">
        Showing <span className="font-medium text-slate-700">{from}–{to}</span> of{' '}
        <span className="font-medium text-slate-700">{totalItems}</span> {plural}
      </span>

      {/* Page buttons */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <PaginationBtn
            onClick={() => onPage(page - 1)}
            disabled={page === 1}
            aria-label="Previous page"
          >
            <ChevronLeftIcon size={13} />
          </PaginationBtn>

          {nums.map((n, i) =>
            n === '…' ? (
              <span key={`ellipsis-${i}`} className="w-8 text-center text-xs text-slate-400 select-none">…</span>
            ) : (
              <PaginationBtn
                key={n}
                onClick={() => onPage(n as number)}
                active={n === page}
              >
                {n}
              </PaginationBtn>
            )
          )}

          <PaginationBtn
            onClick={() => onPage(page + 1)}
            disabled={page === totalPages}
            aria-label="Next page"
          >
            <ChevronRightIcon size={13} />
          </PaginationBtn>
        </div>
      )}
    </div>
  );
}

function PaginationBtn({
  children,
  onClick,
  disabled,
  active,
  'aria-label': ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  'aria-label'?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`min-w-[28px] h-7 flex items-center justify-center rounded text-xs font-medium transition-colors
        ${active
          ? 'bg-blue-600 text-white'
          : disabled
            ? 'text-slate-300 cursor-default'
            : 'text-slate-600 hover:bg-slate-200'
        }`}
    >
      {children}
    </button>
  );
}
