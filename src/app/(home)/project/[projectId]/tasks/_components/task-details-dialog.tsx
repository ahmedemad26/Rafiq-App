"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronDown, Link2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { TaskStatus } from "@/lib/constants/task-status";
import { TASK_STATUSES, taskStatusLabel } from "@/lib/constants/task-status";
import { updateTask } from "@/lib/actions/products/tasks/update-task";
import { queryKeys } from "@/lib/state/query-keys";
import type { ProjectMember } from "@/lib/types/member";
import { cn } from "@/lib/utils/utils";
import { useProjectMembers } from "../../members/_hooks/use-project-members";
import { useProjectTaskDetails } from "../_hooks/use-project-task-details";

type TaskDetailsDialogProps = {
  projectId: string;
  taskId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function formatDate(value: string | null | undefined): string {
  if (!value?.trim()) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function initialsFromName(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "NA";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

function normalizeStatus(value: string | null | undefined): TaskStatus | null {
  if (!value?.trim()) return null;
  const normalized = value.trim().toUpperCase();
  return (TASK_STATUSES as readonly string[]).includes(normalized) ? (normalized as TaskStatus) : null;
}

function statusBadgeClass(status: TaskStatus | null): string {
  if (status === "TO_DO") return "bg-slate-200 text-slate-700";
  if (status === "IN_PROGRESS") return "bg-[#CFE1FF] text-[#1A4D9E]";
  if (status === "DONE") return "bg-[#78E7AE] text-[#0D3C25]";
  if (status === "BLOCKED") return "bg-rose-200 text-rose-800";
  return "bg-indigo-100 text-indigo-700";
}

function PersonRow({
  label,
  name,
  avatar,
}: {
  label: string;
  name: string;
  avatar: string | null;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold tracking-[0.08em] text-slate-400 uppercase">{label}</p>
      <div className="mt-2 flex items-center gap-2">
        <span
          className={cn(
            "inline-flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full text-[10px] font-bold",
            avatar ? "bg-slate-200 text-transparent" : "bg-[#E8EEF8] text-[#003380]",
          )}
        >
          {avatar ? (
            <span
              className="size-full bg-cover bg-center"
              style={{ backgroundImage: `url(${avatar})` }}
              aria-hidden
            />
          ) : (
            initialsFromName(name)
          )}
        </span>
        <p className="truncate text-sm font-medium text-[#11284d]">{name}</p>
      </div>
    </div>
  );
}

function normalizeName(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

export default function TaskDetailsDialog({
  projectId,
  taskId,
  open,
  onOpenChange,
}: TaskDetailsDialogProps) {
  const queryClient = useQueryClient();
  const { data: task, isPending, isError } = useProjectTaskDetails({
    projectId,
    taskId,
    enabled: open,
  });
  const { data: members = [], isPending: isMembersPending } = useProjectMembers(projectId);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [assigneeMenuOpen, setAssigneeMenuOpen] = useState(false);
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

  const status = normalizeStatus(task?.status ?? null);
  const taskWithAssigneeId = task as (typeof task & { assignee_id?: string | null }) | null;
  const currentAssigneeId = taskWithAssigneeId?.assignee_id?.trim() || "";
  const assignableMembers = members.filter((m: ProjectMember) => Boolean(m.userId));
  const currentAssignee =
    assignableMembers.find((m) => m.id === currentAssigneeId || (m.userId ?? "") === currentAssigneeId) ??
    assignableMembers.find((m) => normalizeName(m.name) === normalizeName(task?.assignee_name));

  const handleStatusChange = async (nextStatus: TaskStatus) => {
    if (nextStatus === status || updateMutation.isPending) {
      setStatusMenuOpen(false);
      return;
    }
    setStatusMenuOpen(false);
    try {
      await updateMutation.mutateAsync({ status: nextStatus });
      toast.success("Status updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update status.");
    }
  };

  const handleAssigneeChange = async (assigneeId: string | null) => {
    if (updateMutation.isPending) return;
    if ((assigneeId ?? "") === currentAssigneeId) {
      setAssigneeMenuOpen(false);
      return;
    }
    setAssigneeMenuOpen(false);
    try {
      await updateMutation.mutateAsync({ assignee_id: assigneeId });
      toast.success("Assignee updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update assignee.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[min(92vh,760px)] w-full max-w-[calc(100%-1.5rem)] overflow-y-auto rounded-md p-0 sm:max-w-[980px]"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Task Details</DialogTitle>
        </DialogHeader>

        {isPending ? (
          <div className="space-y-4 p-6">
            <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
            <div className="h-8 w-2/3 animate-pulse rounded bg-slate-200" />
            <div className="h-28 animate-pulse rounded bg-slate-100" />
            <div className="h-28 animate-pulse rounded bg-slate-100" />
          </div>
        ) : null}

        {!isPending && isError ? (
          <p className="px-6 py-8 text-sm text-slate-600">Failed to load task details</p>
        ) : null}

        {!isPending && !isError && !task ? <p className="px-6 py-8 text-sm text-slate-600">Task not found</p> : null}

        {!isPending && !isError && task ? (
          <div className="grid min-h-[620px] grid-cols-1 divide-y sm:grid-cols-[1.75fr_1fr] sm:divide-x sm:divide-y-0">
            <section className="flex min-h-full flex-col">
              <div className="space-y-4 p-6">
                <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded bg-[#E8EEF8] px-2 py-1 text-[11px] font-bold tracking-[0.08em] text-[#003380] uppercase">
                  {task.task_id?.trim() || "TASK"}
                </span>
                {task.epic_id?.trim() ? (
                  <span className="text-sm font-medium text-slate-500">{task.epic_id}</span>
                ) : null}
                </div>

                <h2 className="text-[44px] font-bold leading-[1.05] text-[#10294D]">
                  {task.title?.trim() || "Untitled task"}
                </h2>
              </div>

              <div className="space-y-2 border-t border-slate-200 px-6 py-5">
                <p className="text-[10px] font-bold tracking-[0.08em] text-slate-500 uppercase">Description</p>
                <p className="whitespace-pre-wrap text-[24px] leading-[1.7] text-slate-700">
                  {task.description?.trim() || "No description provided"}
                </p>
              </div>

              <div className="mt-auto flex items-center justify-between border-t border-slate-200 bg-[#F4F7FF] px-6 py-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
                >
                  <Link2 className="size-3.5" />
                  Copy link
                </button>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="inline-flex h-8 items-center justify-center rounded bg-[#D9E4FF] px-4 text-sm font-semibold text-[#10294D] hover:bg-[#cbd9ff]"
                >
                  Close
                </button>
              </div>
            </section>

            <aside className="space-y-6 bg-[#EEF1FB] p-6" ref={popoverRef}>
              <div className="relative">
                <p className="text-[10px] font-bold tracking-[0.08em] text-slate-400 uppercase">Status</p>
                <button
                  type="button"
                  disabled={updateMutation.isPending}
                  onClick={() => {
                    setAssigneeMenuOpen(false);
                    setStatusMenuOpen((prev) => !prev);
                  }}
                  className={cn(
                    "mt-2 inline-flex w-full items-center justify-between rounded-sm px-3 py-2 text-[10px] font-bold tracking-[0.08em] uppercase",
                    statusBadgeClass(status),
                    updateMutation.isPending && "cursor-not-allowed opacity-60",
                  )}
                >
                  <span>{status ? taskStatusLabel(status) : "Unknown"}</span>
                  <ChevronDown className="size-3.5" />
                </button>
                {statusMenuOpen ? (
                  <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
                    {TASK_STATUSES.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => void handleStatusChange(item)}
                        className={cn(
                          "flex w-full items-center justify-between px-3 py-2 text-left text-xs font-semibold uppercase hover:bg-slate-50",
                          status === item ? "bg-slate-50 text-[#003380]" : "text-slate-700",
                        )}
                      >
                        {taskStatusLabel(item)}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="relative">
                <button
                  type="button"
                  disabled={updateMutation.isPending}
                  onClick={() => {
                    setStatusMenuOpen(false);
                    setAssigneeMenuOpen((prev) => !prev);
                  }}
                  className={cn(
                    "w-full rounded-md p-0 text-left",
                    updateMutation.isPending && "cursor-not-allowed opacity-60",
                  )}
                >
                  <PersonRow
                    label="Assignee"
                    name={task.assignee_name?.trim() || "Unassigned"}
                    avatar={task.assignee_avatar?.trim() || null}
                  />
                </button>
                {assigneeMenuOpen ? (
                  <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-56 overflow-y-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg">
                    <button
                      type="button"
                      onClick={() => void handleAssigneeChange(null)}
                      className="w-full px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Unassigned
                    </button>
                    {isMembersPending ? (
                      <p className="px-3 py-2 text-xs text-slate-500">Loading members…</p>
                    ) : null}
                    {assignableMembers.map((member) => {
                      const isActive =
                        member.id === (currentAssignee?.id ?? "") ||
                        member.userId === (currentAssignee?.userId ?? "");
                      return (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => void handleAssigneeChange(member.userId)}
                          className={cn(
                            "w-full px-3 py-2 text-left text-sm hover:bg-slate-50",
                            isActive ? "bg-slate-50 font-semibold text-[#003380]" : "text-slate-700",
                          )}
                        >
                          {member.name?.trim() || member.email || "Member"}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              <PersonRow
                label="Reporter"
                name={task.reporter_name?.trim() || "Unknown"}
                avatar={task.reporter_avatar?.trim() || null}
              />

              <div className="border-t border-slate-300 pt-4 text-sm">
                <div className="flex items-center justify-between gap-2 py-1.5">
                  <span className="text-slate-500">Due Date</span>
                  <span className="font-semibold text-[#11284d]">{formatDate(task.due_date)}</span>
                </div>
                <div className="flex items-center justify-between gap-2 py-1.5">
                  <span className="text-slate-500">Created At</span>
                  <span className="font-semibold text-[#11284d]">{formatDate(task.created_at ?? null)}</span>
                </div>
              </div>
            </aside>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

