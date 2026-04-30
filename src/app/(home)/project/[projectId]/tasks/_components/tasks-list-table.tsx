"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { TASK_STATUSES, type TaskStatus, taskStatusLabel } from "@/lib/constants/task-status";
import type { ProjectMember } from "@/lib/types/member";
import type { ProjectTask } from "@/lib/types/project-tasks";
import { cn } from "@/lib/utils/utils";

type TasksListTableProps = {
  data: ProjectTask[];
  totalItems: number;
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  hasSearch: boolean;
  currentPage: number;
  pageSize: number;
  members?: ProjectMember[];
  onPageChange: (page: number) => void;
  onOpenTask: (taskId: string) => void;
};

function initialsFromName(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "NA";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function formatDueDate(value: string | null): string {
  if (!value?.trim()) return "No due date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No due date";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function normalizedStatus(value: string | null | undefined): TaskStatus | null {
  if (!value?.trim()) return null;
  const normalized = value.trim().toUpperCase();
  return (TASK_STATUSES as readonly string[]).includes(normalized) ? (normalized as TaskStatus) : null;
}

function statusBadgeClass(status: TaskStatus | null) {
  if (status === "DONE") return "bg-emerald-100 text-emerald-700";
  if (status === "BLOCKED") return "bg-rose-100 text-rose-700";
  if (status === "IN_PROGRESS") return "bg-blue-100 text-blue-700";
  if (status === "TO_DO") return "bg-slate-200 text-slate-700";
  return "bg-indigo-100 text-indigo-700";
}

function TaskRow({
  task,
  members,
  onOpenTask,
}: {
  task: ProjectTask;
  members: ProjectMember[];
  onOpenTask: (taskId: string) => void;
}) {
  const assignedMember =
    members.find((member) => {
      const memberUserId = member.userId?.trim();
      const taskAssigneeId = task.assignee_id?.trim();
      return Boolean(memberUserId && taskAssigneeId && memberUserId === taskAssigneeId);
    }) ?? null;
  const assigneeName =
    assignedMember?.name?.trim() ||
    assignedMember?.email?.trim() ||
    task.assignee_name?.trim() ||
    task.assignee_email?.trim() ||
    "Unassigned";
  const assigneeAvatar = assignedMember?.avatarUrl?.trim() || task.assignee_avatar?.trim() || null;
  const status = normalizedStatus(task.status);

  return (
    <tr
      role="button"
      tabIndex={0}
      onClick={() => onOpenTask(task.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenTask(task.id);
        }
      }}
      className="cursor-pointer border-b border-slate-100 text-sm text-[#11284d] last:border-b-0"
    >
      <td className="px-4 py-4 text-xs font-medium text-[#1b4f9c]">{task.task_id ?? "—"}</td>
      <td className="px-4 py-4">
        <p className="line-clamp-2 max-w-[360px] font-medium">{task.title?.trim() || "Untitled task"}</p>
      </td>
      <td className="px-4 py-4 text-sm text-slate-600">{formatDueDate(task.due_date)}</td>
      <td className="px-4 py-4">
        <span
          className={cn(
            "inline-flex rounded px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase",
            statusBadgeClass(status),
          )}
        >
          {status ? taskStatusLabel(status) : "Unknown"}
        </span>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-full text-[9px] font-bold",
              assigneeAvatar ? "bg-slate-200 text-transparent" : "bg-[#E8EEF8] text-[#003380]",
            )}
          >
            {assigneeAvatar ? (
              <span
                className="size-full bg-cover bg-center"
                style={{ backgroundImage: `url(${assigneeAvatar})` }}
                aria-hidden
              />
            ) : (
              initialsFromName(assigneeName)
            )}
          </span>
          <span className="truncate text-sm text-slate-700">{assigneeName}</span>
        </div>
      </td>
      <td className="px-4 py-4 text-right text-xl leading-none text-slate-500">...</td>
    </tr>
  );
}

export default function TasksListTable({
  data,
  totalItems,
  isPending,
  isError,
  errorMessage,
  hasSearch,
  currentPage,
  pageSize,
  members = [],
  onPageChange,
  onOpenTask,
}: TasksListTableProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-slate-100 text-left text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              <th className="px-4 py-3">Task</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Due Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Assignee</th>
              <th className="px-4 py-3 text-right">Settings</th>
            </tr>
          </thead>
          <tbody>
            {isPending ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                  Loading tasks...
                </td>
              </tr>
            ) : null}
            {!isPending && isError ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                  {errorMessage || (hasSearch ? "Failed to search tasks" : "Failed to load tasks")}
                </td>
              </tr>
            ) : null}
            {!isPending && !isError && data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                  {hasSearch ? "No tasks found matching your search" : "No tasks found for this project"}
                </td>
              </tr>
            ) : null}
            {!isPending && !isError && data.map((task) => (
              <TaskRow key={task.id} task={task} members={members} onOpenTask={onOpenTask} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
        <span>
          Showing {start}-{end} of {totalItems} tasks
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="text-slate-500 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous page"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1 || isPending}
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <div className="flex items-center gap-1.5">
            {pages.map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                disabled={isPending}
                className={cn(
                  "inline-flex h-6 min-w-6 items-center justify-center rounded px-1.5 text-[11px] font-semibold",
                  page === currentPage
                    ? "bg-[#E8EEF8] text-[#003380]"
                    : "text-slate-500 hover:bg-slate-100",
                )}
                aria-label={`Go to page ${page}`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="text-slate-500 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next page"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages || isPending}
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

