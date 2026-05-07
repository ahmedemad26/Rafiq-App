"use client";

import Link from "next/link";
import { ListFilter, Search } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

type TasksListHeaderProps = {
  projectId: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  isSearching?: boolean;
  onViewChange: (nextView: "list" | "board") => void;
};

export default function TasksListHeader({
  projectId,
  searchValue,
  onSearchChange,
  isSearching,
  onViewChange,
}: TasksListHeaderProps) {
  const isMobile = useIsMobile();

  return (
    <header className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[42px] leading-[1.05] font-bold tracking-tight text-[#11284d]">Active Workboard</h1>
          {!isMobile ? (
            <p className="mt-1 text-sm text-slate-500">
            Curating project production pipeline and milestones.
            </p>
          ) : null}
        </div>

        <div className="flex w-full items-center gap-2 pt-1 sm:w-auto">
          <label className="relative block w-full sm:w-[300px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search tasks..."
              className="h-10 w-full rounded-md border border-slate-200 bg-[#EEF2FF] pl-9 pr-3 text-sm text-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-[#003380]/20"
            />
            {isSearching ? (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-500">
                Loading...
              </span>
            ) : null}
          </label>
          {!isMobile ? (
            <select
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-[#11284d] outline-none focus-visible:ring-2 focus-visible:ring-[#003380]/20"
              value="list"
              onChange={(e) => onViewChange(e.target.value as "list" | "board")}
            >
              <option value="list">List View</option>
              <option value="board">Board View</option>
            </select>
          ) : null}
          {!isMobile ? (
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-[#EEF2FF] text-slate-500"
              aria-label="Filter tasks"
            >
              <ListFilter className="size-4" />
            </button>
          ) : null}
        </div>
      </div>
      {isMobile ? (
        <Link
          href={`/project/${projectId}/tasks/new`}
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-[#0D4DB8] px-4 text-sm font-semibold text-white shadow-sm"
        >
          + Create Task
        </Link>
      ) : null}
    </header>
  );
}


