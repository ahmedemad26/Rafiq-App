import { Skeleton } from "../ui/skeleton";
import { Plus, Search } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

    export function EpicsLoadingState() {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-200/70 bg-white p-5 shadow-[0_4px_24px_rgba(15,23,42,0.05)]"
            >
              <Skeleton  className="h-6 w-16 bg-[#E8EEF8]" />
              <Skeleton className="mt-4 h-7 w-4/5 bg-[#E8EEF8]" />
              <Skeleton className="mt-2 h-7 w-3/5 bg-[#E8EEF8]" />
              <div className="mt-5 flex items-center gap-3">
                <Skeleton className="size-10 rounded-full bg-[#E8EEF8]" />
                <div className="w-full space-y-2">
                  <Skeleton className="h-3 w-20 bg-[#E8EEF8]" />
                  <Skeleton className="h-4 w-36 bg-[#E8EEF8]" />
                </div>
              </div>
              <Skeleton className="mt-5 h-px w-full bg-[#E8EEF8]" />
              <div className="mt-3 flex justify-between">
                <Skeleton className="h-3.5 w-24 bg-[#E8EEF8]" />
                <Skeleton className="h-3.5 w-20 bg-[#E8EEF8]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
export function EpicsEmptyState({ projectId, title }: { projectId: string; title?: string }) {
    return (
      <div className="mx-auto mt-6 flex w-full max-w-3xl flex-col items-center rounded-2xl bg-white px-8 py-14 text-center shadow-[0_4px_24px_rgba(15,23,42,0.05)]">
        <div className="mb-6 inline-flex size-20 items-center justify-center rounded-3xl bg-[#EEF2FF] text-brand-primary">
          <Search className="size-8" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-[#11284d]">
          {title ?? "No epics found for this project"}
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600">
          Break down your large project into manageable epics to track progress better and
          maintain architectural clarity.
        </p>
        <Button asChild variant="brand" size="default" className="mt-7 h-11 px-6">
          <Link href={`/project/${projectId}/epics/new`}>
            <Plus className="mr-2 size-4" />
            Create First Epic
          </Link>
        </Button>
      </div>
    );
  }
  
export function EpicsErrorState({ onRetry, message }: { onRetry: () => void; message?: string }) {
    return (
      <div className="mx-auto mt-6 flex min-h-[420px] w-full max-w-2xl flex-col items-center justify-center rounded-2xl bg-white px-8 text-center shadow-[0_4px_24px_rgba(15,23,42,0.05)]">
        <div className="mb-5 inline-flex size-14 items-center justify-center rounded-2xl bg-red-100 text-red-500">
          <AlertCircle className="size-7" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-[#11284d]">{message ?? "Failed to load epics"}</h2>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600">
          We&apos;re having trouble retrieving your project epics right now. Please try again.
        </p>
        <Button
          type="button"
          variant="brand"
          size="default"
          onClick={onRetry}
          className="mt-6 h-10 rounded-md bg-[#003380]! px-5 text-sm font-semibold text-white hover:bg-[#002d6e]! hover:opacity-100!"
        >
          Retry Connection
        </Button>
      </div>
    );
  }
  
export function PaginationUi({
    totalCount,
    totalPages,
    currentPage,
    pageSize,
    onPageChange,
  }: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    onPageChange: (page: number) => void;
  }) {
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