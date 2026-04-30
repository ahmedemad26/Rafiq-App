"use client";

import Link from "next/link";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { taskStatusLabel } from "@/lib/constants/task-status";
import { cn } from "@/lib/utils/utils";
import { useProjectTasksByStatus } from "../_hooks/use-project-tasks-by-status";
import TaskCard from "./task-card";
import TasksInfiniteSentinel from "./tasks-infinite-sentinel";
import type { StatusColumnProps } from "../types/tasks-board-view.type";

export default function StatusColumn({
  projectId,
  status,
  onOpenTask,
  searchTerm,
  onChangeTaskStatus,
}: StatusColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status}`,
    data: { status },
  });
  const {
    data,
    isPending,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
    refetch,
  } = useProjectTasksByStatus(projectId, status, 10, searchTerm);
  const tasks = data?.pages.flatMap((page) => page.data) ?? [];
  const count = data?.pages[0]?.total ?? 0;
  const addTaskHref = `/project/${projectId}/tasks/new?status=${status}`;
  const errorMessage =
    error instanceof Error ? error.message : searchTerm ? "Failed to search tasks" : "Failed to load tasks";

  return (
    <section className="w-[260px] shrink-0 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-slate-400" />
          <h3 className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">
            {taskStatusLabel(status)}
          </h3>
          <span className="rounded bg-[#E8EEF8] px-1.5 py-0.5 text-[10px] font-semibold text-[#003380]">
            {count}
          </span>
        </div>
        <Link
          href={addTaskHref}
          className="inline-flex size-5 items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          aria-label={`Add task in ${taskStatusLabel(status)}`}
        >
          <Plus className="size-4" />
        </Link>
      </div>

      <Link
        href={addTaskHref}
        className="flex h-9 items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 bg-white text-[11px] font-bold tracking-[0.08em] text-slate-400 uppercase transition-colors hover:border-slate-400 hover:text-slate-500"
      >
        <Plus className="size-3.5" />
        Add New Task
      </Link>

      <div ref={setNodeRef} className={cn("space-y-2 rounded-lg", isOver ? "ring-1 ring-blue-300" : "")}>
        {isPending ? (
          <div className="space-y-2">
            {[0, 1].map((item) => (
              <div key={item} className="animate-pulse rounded-lg border border-slate-200 bg-white p-3">
                <div className="mb-2 h-3 w-2/3 rounded bg-slate-200" />
                <div className="h-3 w-1/3 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : null}

        {!isPending && isError ? (
          <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-500">
            {errorMessage}
          </div>
        ) : null}

        {!isPending && !isError ? (
          <SortableContext
            items={tasks.map((task) => task.id)}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                status={status}
                onOpenTask={onOpenTask}
                onChangeTaskStatus={onChangeTaskStatus}
              />
            ))}
          </SortableContext>
        ) : null}
        {!isPending ? (
          <TasksInfiniteSentinel
            hasNextPage={Boolean(hasNextPage)}
            isFetchingNextPage={isFetchingNextPage}
            isError={isFetchNextPageError}
            onLoadMore={() => void fetchNextPage()}
            onRetry={() => void refetch()}
          />
        ) : null}
        {!isPending && !isError && tasks.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-white p-3 text-xs text-slate-500">
            {searchTerm ? "No tasks found matching your search" : "No tasks found for this project"}
          </div>
        ) : null}
      </div>
    </section>
  );
}
