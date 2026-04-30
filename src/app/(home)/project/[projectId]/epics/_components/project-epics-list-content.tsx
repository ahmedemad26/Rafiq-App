"use client";

import { useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import type { ProjectEpic } from "@/lib/types/epics";
import EpicsInfiniteSentinel from "./epics-infinite-sentinel";
import EpicDetailsDialog from "./epic-details-dialog";
import TaskDetailsDialog from "../../tasks/_components/task-details-dialog";
import {
  EpicsEmptyState,
  EpicsErrorState,
  EpicsLoadingState,
  PaginationUi,
} from "@/components/skeleton/epics-skelton";

type ProjectEpicsListContentProps = {
  projectId: string;
  epics: ProjectEpic[];
  searchValue: string;
  errorMessage?: string;
  isPending: boolean;
  isError: boolean;
  isMobile: boolean;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  onRetry: () => void;
  onPageChange: (page: number) => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
};

function formatDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function initialsFromName(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "NA";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function EpicCard({
  epic,
  onOpenDetails,
}: {
  epic: ProjectEpic;
  onOpenDetails: (epic: ProjectEpic) => void;
}) {
  const assigneeName = epic.assignee?.name?.trim() || "Unassigned";
  const creatorName = epic.created_by?.name?.trim() || "Unknown";

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`Open details for epic ${epic.epic_id || epic.title || "Untitled"}`}
      onClick={() => onOpenDetails(epic)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenDetails(epic);
        }
      }}
      className="cursor-pointer overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.05)] outline-none ring-[#003380] transition-shadow hover:shadow-[0_6px_28px_rgba(15,23,42,0.08)] focus-visible:ring-2"
    >
      <div className="border-l-4 border-l-emerald-500 p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <span className="inline-flex h-6 items-center rounded-md bg-emerald-100 px-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-emerald-700">
            {epic.epic_id || "EPIC"}
          </span>
          <button
            type="button"
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="More actions"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="block h-1 w-1 rounded-full bg-current" />
            <span className="mt-0.5 block h-1 w-1 rounded-full bg-current" />
            <span className="mt-0.5 block h-1 w-1 rounded-full bg-current" />
          </button>
        </div>

        <h3 className="line-clamp-2 min-h-14 text-xl font-bold leading-tight text-[#11284d]">
          {epic.title || "Untitled Epic"}
        </h3>

        <div className="mt-4 flex items-center gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">
            {initialsFromName(assigneeName)}
          </span>
          <div className="min-w-0">
            <p className="text-xs text-slate-500">Assignee</p>
            <p className="truncate text-sm font-semibold text-[#11284d]">{assigneeName}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
        <p className="truncate">Created by: {creatorName}</p>
        <p className="inline-flex shrink-0 items-center gap-1">
          <CalendarDays className="size-3.5" />
          {formatDate(epic.created_at)}
        </p>
      </div>
    </article>
  );
}

export default function ProjectEpicsListContent({
  projectId,
  epics,
  searchValue,
  errorMessage,
  isPending,
  isError,
  isMobile,
  totalCount,
  totalPages,
  currentPage,
  pageSize,
  onRetry,
  onPageChange,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: ProjectEpicsListContentProps) {
  const [selectedEpicId, setSelectedEpicId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const selectedEpic = useMemo(
    () => (selectedEpicId ? epics.find((e) => e.id === selectedEpicId) ?? null : null),
    [epics, selectedEpicId],
  );

  const hasSearch = Boolean(searchValue.trim());
  const showEmpty = !isPending && !isError && epics.length === 0;
  const showList = !isPending && !isError && epics.length > 0;

  return (
    <>
      <EpicDetailsDialog
        projectId={projectId}
        epic={selectedEpic}
        open={Boolean(selectedEpicId) && Boolean(selectedEpic)}
        onTaskOpen={(taskId) => setSelectedTaskId(taskId)}
        onOpenChange={(next) => {
          if (!next) {
            setSelectedEpicId(null);
          }
        }}
      />
      <TaskDetailsDialog
        projectId={projectId}
        taskId={selectedTaskId}
        open={Boolean(selectedTaskId)}
        onOpenChange={(next) => {
          if (!next) {
            setSelectedTaskId(null);
          }
        }}
      />
      {isPending ? <EpicsLoadingState /> : null}
      {!isPending && isError ? (
        <EpicsErrorState
          message={errorMessage || (hasSearch ? "Failed to search epics" : "Failed to load epics")}
          onRetry={onRetry}
        />
      ) : null}
      {showEmpty ? (
        <EpicsEmptyState
          projectId={projectId}
          title={hasSearch ? "No epics found matching your search" : "No epics found for this project"}
        />
      ) : null}
      {showList ? (
        <>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {epics.map((epic) => (
              <EpicCard
                key={epic.id}
                epic={epic}
                onOpenDetails={(e) => setSelectedEpicId(e.id)}
              />
            ))}
          </div>
          {isMobile ? (
            <EpicsInfiniteSentinel
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              onLoadMore={onLoadMore}
            />
          ) : (
            <PaginationUi
              totalCount={totalCount}
              totalPages={totalPages}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={onPageChange}
            />
          )}
        </>
      ) : null}
    </>
  );
}
