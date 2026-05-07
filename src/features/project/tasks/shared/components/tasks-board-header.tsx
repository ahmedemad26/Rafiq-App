"use client";

import { useRouter } from "next/navigation";
import { ListFilter, Search } from "lucide-react";
import type { TasksBoardHeaderProps } from "@/lib/types/features/tasks/tasks-board-view";
import { useIsMobile } from "@/hooks/use-mobile";

export default function TasksBoardHeader({
  projectId,
  view,
  searchValue,
  debouncedSearchValue,
  setSearchValue,
}: TasksBoardHeaderProps) {
  const router = useRouter();
  const isMobile = useIsMobile();

  return (
    <header className="space-y-4">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-[#11284d]">Active Workboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Curating project production pipeline and milestones.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <label className="relative w-full max-w-[300px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search tasks..."
            className="h-10 w-full rounded-md border border-slate-200 bg-[#EEF2FF] pl-9 pr-3 text-sm text-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-[#003380]/20"
          />
          {searchValue.trim() !== debouncedSearchValue ? (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-500">
              Loading...
            </span>
          ) : null}
        </label>
        {!isMobile ? (
          <select
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-[#11284d] outline-none focus-visible:ring-2 focus-visible:ring-[#003380]/20"
            value={view}
            onChange={(e) => router.push(`/project/${projectId}/tasks?view=${e.target.value}`)}
          >
            <option value="list">List View</option>
            <option value="board">Board View</option>
          </select>
        ) : null}
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-[#EEF2FF] text-slate-500"
          aria-label="Filter tasks"
        >
          <ListFilter className="size-4" />
        </button>
      </div>
    </header>
  );
}

