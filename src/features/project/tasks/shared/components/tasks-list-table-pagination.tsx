import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/utils";

type TasksListTablePaginationProps = {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  isPending: boolean;
  onPageChange: (page: number) => void;
};

export function TasksListTablePagination({
  totalItems,
  currentPage,
  pageSize,
  totalPages,
  isPending,
  onPageChange,
}: TasksListTablePaginationProps) {
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="hidden items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500 sm:flex">
      <span>
        Showing {start}-{end} of {totalItems} tasks
      </span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="text-slate-500 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous page"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1 || isPending}
        >
          <ChevronLeft className="size-3.5" />
        </button>
        <div className="flex items-center gap-1.5">
          {pages.map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              disabled={isPending}
              className={cn(
                "inline-flex h-6 min-w-6 items-center justify-center rounded px-1.5 text-[11px] font-semibold",
                page === currentPage ? "bg-[#E8EEF8] text-[#003380]" : "text-slate-500 hover:bg-slate-100",
              )}
              aria-label={`Go to page ${page}`}
            >
              {page}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="text-slate-500 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next page"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages || isPending}
        >
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
