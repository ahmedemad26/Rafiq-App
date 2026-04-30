"use client";

import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { TaskStatus } from "@/lib/constants/task-status";
import { TASK_STATUSES } from "@/lib/constants/task-status";
import { updateTaskStatus } from "@/lib/actions/products/tasks/update-task-status";
import type { ProjectTask } from "@/lib/types/project-tasks";
import { queryKeys } from "@/lib/state/query-keys";
import TaskDetailsDialog from "./task-details-dialog";
import StatusColumn from "./status-column";
import TasksBoardHeader from "./tasks-board-header";
import type { DragTaskData, TasksInfiniteData } from "../types/tasks-board-view.type";
import { resolveDropStatus } from "./tasks-board-view.utils";

export default function TasksBoardView({
  projectId,
  initialView,
}: {
  projectId: string;
  initialView?: string;
}) {
  const queryClient = useQueryClient();
  const view = useMemo(() => (initialView === "list" ? "list" : "board"), [initialView]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchValue(searchValue.trim());
    }, 400);
    return () => window.clearTimeout(timer);
  }, [searchValue]);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const taskQueryKey = (status: TaskStatus) =>
    [...queryKeys.projects.root, "tasks", "board", projectId, status, debouncedSearchValue] as const;

  const moveTaskMutation = useMutation({
    mutationFn: async (payload: {
      taskId: string;
      fromStatus: TaskStatus;
      toStatus: TaskStatus;
    }) => {
      const result = await updateTaskStatus(payload.taskId, payload.toStatus);
      if ("error" in result && result.error) {
        throw new Error(result.error);
      }
      return payload;
    },
    onMutate: async ({ taskId, fromStatus, toStatus }) => {
      if (fromStatus === toStatus) return;

      await Promise.all([
        queryClient.cancelQueries({ queryKey: taskQueryKey(fromStatus) }),
        queryClient.cancelQueries({ queryKey: taskQueryKey(toStatus) }),
      ]);

      const previousFrom = queryClient.getQueryData<TasksInfiniteData>(taskQueryKey(fromStatus));
      const previousTo = queryClient.getQueryData<TasksInfiniteData>(taskQueryKey(toStatus));

      let movedTask: ProjectTask | null = null;

      queryClient.setQueryData<TasksInfiniteData>(taskQueryKey(fromStatus), (current) => {
        if (!current) return current;
        return {
          ...current,
          pages: current.pages.map((page, index) => {
            const nextItems = page.data.filter((item) => {
              if (item.id === taskId) movedTask = item;
              return item.id !== taskId;
            });
            return {
              ...page,
              data: nextItems,
              total: index === 0 ? Math.max(0, page.total - 1) : page.total,
            };
          }),
        };
      });

      queryClient.setQueryData<TasksInfiniteData>(taskQueryKey(toStatus), (current) => {
        if (!current) return current;
        const taskToInsert =
          movedTask ??
          ({
            id: taskId,
            title: "Moved task",
            due_date: null,
            assignee_name: null,
            assignee_avatar: null,
            status: toStatus,
          } as ProjectTask);

        const firstPage = current.pages[0];
        if (!firstPage) return current;

        return {
          ...current,
          pages: [
            {
              ...firstPage,
              data: [{ ...taskToInsert, status: toStatus }, ...firstPage.data],
              total: firstPage.total + 1,
            },
            ...current.pages.slice(1),
          ],
        };
      });

      return { previousFrom, previousTo, fromStatus, toStatus };
    },
    onError: (error, _vars, context) => {
      if (context?.previousFrom) {
        queryClient.setQueryData(taskQueryKey(context.fromStatus), context.previousFrom);
      }
      if (context?.previousTo) {
        queryClient.setQueryData(taskQueryKey(context.toStatus), context.previousTo);
      }
      toast.error(error instanceof Error ? error.message : "Failed to update task status");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: [...queryKeys.projects.root, "tasks"],
      });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const activeData = event.active?.data?.current as DragTaskData | undefined;
    const taskId = activeData?.taskId;
    const fromStatus = activeData?.status;
    const toStatus = resolveDropStatus(event);

    if (!taskId || !fromStatus || !toStatus || fromStatus === toStatus) {
      return;
    }

    moveTaskMutation.mutate({ taskId, fromStatus, toStatus });
  };

  return (
    <section className="space-y-5">
      <TaskDetailsDialog
        projectId={projectId}
        taskId={selectedTaskId}
        open={Boolean(selectedTaskId)}
        onOpenChange={(next) => {
          if (!next) setSelectedTaskId(null);
        }}
      />
      <TasksBoardHeader
        projectId={projectId}
        view={view}
        searchValue={searchValue}
        debouncedSearchValue={debouncedSearchValue}
        setSearchValue={setSearchValue}
      />

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max gap-4">
            {TASK_STATUSES.map((status) => (
              <StatusColumn
                key={status}
                projectId={projectId}
                status={status}
                onOpenTask={(taskId) => setSelectedTaskId(taskId)}
                searchTerm={debouncedSearchValue}
              />
            ))}
          </div>
        </div>
      </DndContext>
    </section>
  );
}

