import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationUiProps = {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

export function PaginationUi({
  totalCount,
  totalPages,
  currentPage,
  pageSize,
  onPageChange,
}: PaginationUiProps) {
  const start = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalCount);
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="mt-10 flex items-center justify-between gap-3">
      <p className="text-sm text-slate-500">
        Showing {start}-{end} of {totalCount} epics
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          className="inline-flex size-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Previous page"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="size-4" />
        </button>
        {pageNumbers.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            className={
              pageNumber === currentPage
                ? "inline-flex size-8 items-center justify-center rounded-md bg-brand-primary text-sm font-semibold text-white"
                : "inline-flex size-8 items-center justify-center rounded-md border border-slate-200 bg-white text-sm font-semibold text-slate-600"
            }
            aria-current={pageNumber === currentPage ? "page" : undefined}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </button>
        ))}
        <button
          type="button"
          className="inline-flex size-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Next page"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
