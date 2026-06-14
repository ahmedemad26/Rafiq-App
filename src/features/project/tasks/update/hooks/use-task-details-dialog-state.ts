"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import type { TaskStatus } from "@/lib/constants/task-status";
import { updateTask } from "@/lib/actions/products/tasks/update-task";
import { queryKeys } from "@/lib/state/query-keys";
import type { ProjectMember } from "@/lib/types/member";
import { useProjectMembers } from "@/features/project/members/hooks/use-project-members";
import { useProjectTaskDetails } from "@/features/project/tasks/shared/hooks/use-project-task-details";
import {
  memberAssigneeValue,
  normalizeStatus,
  resolveAssigneeDisplayName,
} from "../utils/task-details-utils";

export function useTaskDetailsDialogState({
  projectId,
  taskId,
  open,
}: {
  projectId: string;
  taskId: string | null;
  open: boolean;
}) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { data: task, isPending, isError } = useProjectTaskDetails({
    projectId,
    taskId,
    enabled: open,
  });
  const { data: members = [], isPending: isMembersPending } = useProjectMembers(projectId);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [assigneeMenuOpen, setAssigneeMenuOpen] = useState(false);
  const [localStatus, setLocalStatus] = useState<TaskStatus | null>(null);
  const [localAssigneeId, setLocalAssigneeId] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const updateMutation = useMutation({
    mutationFn: async (patch: { status?: TaskStatus; assignee_id?: string | null }) => {
      if (!task?.id) throw new Error("Task id is missing.");

      const result = await updateTask(task.id, patch, task.task_id ?? null);

      if ("error" in result) throw new Error(result.error);
      return true;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...queryKeys.projects.root, "tasks"] });
      void queryClient.invalidateQueries({
        queryKey: [...queryKeys.projects.root, "tasks", "details", projectId, taskId],
      });
    },
  });

  useEffect(() => {
    if (!statusMenuOpen && !assigneeMenuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      const el = popoverRef.current;
      if (el && !el.contains(event.target as Node)) {
        setStatusMenuOpen(false);
        setAssigneeMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [statusMenuOpen, assigneeMenuOpen]);

  const status = localStatus ?? normalizeStatus(task?.status ?? null);
  const taskWithAssigneeId = task as (typeof task & { assignee_id?: string | null }) | null;
  const serverAssigneeId = taskWithAssigneeId?.assignee_id?.trim() || "";

  useEffect(() => {
    if (!open || !task?.id) return;
    setLocalStatus(normalizeStatus(task?.status ?? null));
    setLocalAssigneeId(serverAssigneeId || null);
  }, [open, task?.id, serverAssigneeId, task?.status]);

  const effectiveAssigneeId = localAssigneeId?.trim() || serverAssigneeId;
  const assignableMembers = members.filter((m: ProjectMember) => Boolean(m.userId?.trim()));
  const currentAssignee =
    assignableMembers.find(
      (m) => memberAssigneeValue(m) === effectiveAssigneeId || m.id.trim() === effectiveAssigneeId,
    ) ?? null;
  const assigneeDisplayName = resolveAssigneeDisplayName(task, currentAssignee);
  const currentAssigneeValue = currentAssignee ? memberAssigneeValue(currentAssignee) : "";
  const reporterName = task?.reporter_name?.trim() || session?.user?.name?.trim() || "Unknown";
  const reporterAvatar = task?.reporter_avatar?.trim() || session?.user?.image?.trim() || null;

  const handleStatusChange = async (nextStatus: TaskStatus) => {
    if (nextStatus === status || updateMutation.isPending) {
      setStatusMenuOpen(false);
      return;
    }
    const previousStatus = status;
    setLocalStatus(nextStatus);
    setStatusMenuOpen(false);
    try {
      await updateMutation.mutateAsync({ status: nextStatus });
      toast.success("Task updated.");
    } catch {
      setLocalStatus(previousStatus);
      toast.error("Failed to update task. Please try again.");
    }
  };

  const handleAssigneeChange = async (assigneeId: string | null) => {
    if (updateMutation.isPending) return;
    const nextAssigneeId = assigneeId?.trim() || "";
    if (nextAssigneeId === effectiveAssigneeId) {
      setAssigneeMenuOpen(false);
      return;
    }

    const previousLocal = localAssigneeId;
    setLocalAssigneeId(nextAssigneeId || null);
    setAssigneeMenuOpen(false);
    try {
      await updateMutation.mutateAsync({ assignee_id: assigneeId });
      toast.success("Task updated.");
    } catch {
      setLocalAssigneeId(previousLocal);
      toast.error("Failed to update task. Please try again.");
    }
  };

  return {
    task,
    isPending,
    isError,
    popoverRef,
    status,
    statusMenuOpen,
    setStatusMenuOpen,
    assigneeMenuOpen,
    setAssigneeMenuOpen,
    isUpdating: updateMutation.isPending,
    isMembersPending,
    assignableMembers,
    effectiveAssigneeId,
    currentAssigneeValue,
    currentAssignee,
    assigneeDisplayName,
    reporterName,
    reporterAvatar,
    handleStatusChange,
    handleAssigneeChange,
  };
}


