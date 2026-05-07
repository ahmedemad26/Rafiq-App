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
import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import type { TaskStatus } from "@/lib/constants/task-status";
import { TASK_STATUSES } from "@/lib/constants/task-status";
import { updateTaskStatus } from "@/lib/actions/products/tasks/update-task-status";
import type { ProjectTask } from "@/lib/types/project-tasks";
import { queryKeys } from "@/lib/state/query-keys";
import { useProjectMembers } from "@/features/project/members/hooks/use-project-members";
import StatusColumn from "./status-column";
import TasksBoardHeader from "./tasks-board-header";
import type { DragTaskData, TasksInfiniteData } from "@/lib/types/features/tasks/tasks-board-view";
import { resolveDropStatus } from "../utils/tasks-board-view.utils";

const TaskDetailsDialog = dynamic(() => import("@/features/project/tasks/update/components/task-details-dialog"));

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
  const [updatingTaskIds, setUpdatingTaskIds] = useState<Set<string>>(new Set());
  const { data: members = [] } = useProjectMembers(projectId);

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
      setUpdatingTaskIds((current) => {
        const next = new Set(current);
        next.add(taskId);
        return next;
      });

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

      return { previousFrom, previousTo, fromStatus, toStatus, taskId };
    },
    onError: (error, _vars, context) => {
      if (context?.previousFrom) {
        queryClient.setQueryData(taskQueryKey(context.fromStatus), context.previousFrom);
      }
      if (context?.previousTo) {
        queryClient.setQueryData(taskQueryKey(context.toStatus), context.previousTo);
      }
      toast.error("Failed to update task. Please try again.");
    },
    onSuccess: () => {
      toast.success("Task updated.");
    },
    onSettled: (_data, _error, _vars, context) => {
      if (context?.taskId) {
        setUpdatingTaskIds((current) => {
          const next = new Set(current);
          next.delete(context.taskId);
          return next;
        });
      }
      void queryClient.invalidateQueries({
        queryKey: [...queryKeys.projects.root, "tasks"],
      });
    },
  });

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const activeData = event.active?.data?.current as DragTaskData | undefined;
    const taskId = activeData?.taskId;
    const fromStatus = activeData?.status;
    const toStatus = resolveDropStatus(event);

    if (!taskId || !fromStatus || !toStatus || fromStatus === toStatus) {
      return;
    }

    moveTaskMutation.mutate({ taskId, fromStatus, toStatus });
  }, [moveTaskMutation]);

  const handleQuickStatusChange = useCallback((taskId: string, fromStatus: TaskStatus, toStatus: TaskStatus) => {
    if (fromStatus === toStatus) return;
    moveTaskMutation.mutate({ taskId, fromStatus, toStatus });
  }, [moveTaskMutation]);

  const handleOpenTask = useCallback((taskId: string) => {
    setSelectedTaskId(taskId);
  }, []);

  const handleTaskDialogOpenChange = useCallback((next: boolean) => {
    if (!next) setSelectedTaskId(null);
  }, []);

  return (
    <section className="space-y-5">
      {selectedTaskId ? (
        <TaskDetailsDialog
          projectId={projectId}
          taskId={selectedTaskId}
          open
          onOpenChange={handleTaskDialogOpenChange}
        />
      ) : null}
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
                members={members}
                onOpenTask={handleOpenTask}
                searchTerm={debouncedSearchValue}
                updatingTaskIds={updatingTaskIds}
                onChangeTaskStatus={handleQuickStatusChange}
              />
            ))}
          </div>
        </div>
      </DndContext>
    </section>
  );
}



