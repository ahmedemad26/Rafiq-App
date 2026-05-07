import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ProjectsPaginationProps {
  page: number;
  totalPages: number;
  totalProjects: number;
  rangeStart: number;
  rangeEnd: number;
  onPageChange: (nextPage: number) => void;
  isFetching?: boolean;
}

function visiblePageItems(current: number, total: number): (number | "gap")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages = new Set<number>();
  pages.add(1);
  pages.add(total);

  for (let page = current - 1; page <= current + 1; page += 1) {
    if (page >= 1 && page <= total) {
      pages.add(page);
    }
  }

  const sortedPages = [...pages].sort((a, b) => a - b);
  const output: (number | "gap")[] = [];
  let previous = 0;

  for (const page of sortedPages) {
    if (page - previous > 1) {
      output.push("gap");
    }
    output.push(page);
    previous = page;
  }

  return output;
}

export default function ProjectsPagination({
  page,
  totalPages,
  totalProjects,
  rangeStart,
  rangeEnd,
  onPageChange,
  isFetching,
}: ProjectsPaginationProps) {
  const items = visiblePageItems(page, totalPages);
  const safeStart = totalProjects === 0 ? 0 : rangeStart;
  const safeEnd = totalProjects === 0 ? 0 : rangeEnd;

  return (
    <div className="mt-auto flex w-full flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-slate-500">
        Showing {safeStart}–{safeEnd} of {totalProjects} projects
        {isFetching ? <span className="ml-2 text-slate-400">(updating…)</span> : null}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={page === 1 || isFetching}
          onClick={() => onPageChange(page - 1)}
          className="h-8 w-8 rounded-md border-slate-300 text-slate-500"
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </Button>

        <div className="flex flex-wrap items-center gap-1">
          {items.map((item, index) =>
            item === "gap" ? (
              <span key={`gap-${index}`} className="px-1 text-xs text-slate-400" aria-hidden>
                …
              </span>
            ) : (
              <Button
                key={item}
                type="button"
                variant={item === page ? "default" : "outline"}
                size="icon"
                disabled={isFetching}
                onClick={() => onPageChange(item)}
                className={`h-8 w-8 shrink-0 rounded-md text-xs ${
                  item === page
                    ? "bg-[#1d4ed8] text-white hover:bg-[#1d4ed8]"
                    : "border-slate-300 bg-white text-[#434654] hover:bg-white"
                }`}
              >
                {item}
              </Button>
            ),
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={page === totalPages || isFetching}
          onClick={() => onPageChange(page + 1)}
          className="h-8 w-8 rounded-md border-slate-300 text-slate-500"
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
