"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { ProjectEpicsListContentProps } from "@/lib/types/features/epics/project-epics-list-content";
import { EpicsEmptyState, EpicsErrorState, EpicsLoadingState, PaginationUi } from "@/components/loading";
import EpicsInfiniteSentinel from "./epics-infinite-sentinel";
import EpicCard from "./epic-card";

const EpicDetailsDialog = dynamic(() => import("../../update/components/epic-details-dialog"));
const TaskDetailsDialog = dynamic(
  () => import("@/features/project/tasks/update/components/task-details-dialog"),
);

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
      {selectedEpicId && selectedEpic ? (
        <EpicDetailsDialog
          projectId={projectId}
          epic={selectedEpic}
          open
          onTaskOpen={(taskId) => setSelectedTaskId(taskId)}
          onOpenChange={(next) => {
            if (!next) {
              setSelectedEpicId(null);
            }
          }}
        />
      ) : null}
      {selectedTaskId ? (
        <TaskDetailsDialog
          projectId={projectId}
          taskId={selectedTaskId}
          open
          onOpenChange={(next) => {
            if (!next) {
              setSelectedTaskId(null);
            }
          }}
        />
      ) : null}
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
