import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type ProjectsPaginationProps = {
  page: number;
  totalPages: number;
  totalProjects: number;
  rangeStart: number;
  rangeEnd: number;
  onPageChange: (nextPage: number) => void;
  isFetching?: boolean;
};

function visiblePageItems(
  current: number,
  total: number,
): (number | "gap")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const set = new Set<number>();
  set.add(1);
  set.add(total);
  for (let i = current - 1; i <= current + 1; i++) {
    if (i >= 1 && i <= total) set.add(i);
  }

  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  let prev = 0;

  for (const p of sorted) {
    if (p - prev > 1) out.push("gap");
    out.push(p);
    prev = p;
  }

  return out;
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
        {isFetching ? (
          <span className="ml-2 text-slate-400">(updating…)</span>
        ) : null}
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
          {items.map((item, idx) =>
            item === "gap" ? (
              <span
                key={`gap-${idx}`}
                className="px-1 text-xs text-slate-400"
                aria-hidden
              >
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
