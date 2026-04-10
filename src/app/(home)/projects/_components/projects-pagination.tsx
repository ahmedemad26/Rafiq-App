import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// props for projects pagination
type ProjectsPaginationProps = {
  page: number;
  totalPages: number;
  totalProjects: number;
  showingCount: number;
  onPageChange: (nextPage: number) => void;
};

export default function ProjectsPagination({
  page,
  totalPages,
  totalProjects,
  showingCount,
  onPageChange,
}: ProjectsPaginationProps) {
  return (
    <div className="mt-auto flex w-full items-center justify-between pt-6">

      {/* Left text */}
      <p className="text-xs text-slate-500">
        Showing {showingCount} of {totalProjects} active projects
      </p>

      {/* Pagination */}
      <div className="flex items-center gap-2">

        {/* Prev */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="h-8 w-8 rounded-md border-slate-300 text-slate-500"
        >
          <ChevronLeft className="size-4" />
        </Button>

        {/* Numbers  */}
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNumber) => {
              const isActive = pageNumber === page;

              return (
                <Button
                  key={pageNumber}
                  type="button"
                  variant={isActive ? "default" : "outline"}
                  size="icon"
                  onClick={() => onPageChange(pageNumber)}
                  className={`h-8 w-8 shrink-0 rounded-md text-xs ${
                    isActive
                      ? "bg-[#1d4ed8] text-white hover:bg-[#1d4ed8]"
                      : "border-slate-300 bg-white text-[#434654] hover:bg-white"
                  }`}
                >
                  {pageNumber}
                </Button>
              );
            }
          )}
        </div>

        {/* Next */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className="h-8 w-8 rounded-md border-slate-300 text-slate-500"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}