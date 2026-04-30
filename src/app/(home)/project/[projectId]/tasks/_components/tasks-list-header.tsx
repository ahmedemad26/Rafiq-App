"use client";

import { ListFilter, Search } from "lucide-react";

type TasksListHeaderProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  isSearching?: boolean;
  onViewChange: (nextView: "list" | "board") => void;
};

export default function TasksListHeader({
  searchValue,
  onSearchChange,
  isSearching,
  onViewChange,
}: TasksListHeaderProps) {
  return (
    <header className="space-y-1.5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-[#11284d]">Active Workboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Curating project production pipeline and milestones.
          </p>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <label className="relative block w-[260px] sm:w-[300px]">
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
          <select
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-[#11284d] outline-none focus-visible:ring-2 focus-visible:ring-[#003380]/20"
            value="list"
            onChange={(e) => onViewChange(e.target.value as "list" | "board")}
          >
            <option value="list">List View</option>
            <option value="board">Board View</option>
          </select>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-[#EEF2FF] text-slate-500"
            aria-label="Filter tasks"
          >
            <ListFilter className="size-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

