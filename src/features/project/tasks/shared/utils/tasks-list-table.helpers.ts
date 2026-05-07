import { TASK_STATUSES, type TaskStatus } from "@/lib/constants/task-status";
import type { ProjectMember } from "@/lib/types/member";
import type { ProjectTask } from "@/lib/types/project-tasks";

export function initialsFromName(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "NA";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function formatDueDate(value: string | null): string {
  if (!value?.trim()) return "No due date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No due date";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function normalizedStatus(value: string | null | undefined): TaskStatus | null {
  if (!value?.trim()) return null;
  const normalized = value.trim().toUpperCase();
  return (TASK_STATUSES as readonly string[]).includes(normalized) ? (normalized as TaskStatus) : null;
}

export function statusBadgeClass(status: TaskStatus | null) {
  if (status === "DONE") return "bg-emerald-100 text-emerald-700";
  if (status === "BLOCKED") return "bg-rose-100 text-rose-700";
  if (status === "IN_PROGRESS") return "bg-blue-100 text-blue-700";
  if (status === "TO_DO") return "bg-slate-200 text-slate-700";
  return "bg-indigo-100 text-indigo-700";
}

export function nameFromEmail(email: string): string {
  const local = email.split("@")[0]?.trim() ?? "";
  if (!local) return email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getTaskAssigneeDetails(task: ProjectTask, membersByAssigneeId: Map<string, ProjectMember>) {
  const taskAssigneeId = task.assignee_id?.trim() ?? "";
  const assignedMember = taskAssigneeId ? membersByAssigneeId.get(taskAssigneeId) ?? null : null;
  const assigneeName =
    assignedMember?.name?.trim() ||
    (assignedMember?.email?.trim() ? nameFromEmail(assignedMember.email) : "") ||
    task.assignee_name?.trim() ||
    (task.assignee_email?.trim() ? nameFromEmail(task.assignee_email) : "") ||
    "Unassigned";
  const assigneeAvatar = assignedMember?.avatarUrl?.trim() || task.assignee_avatar?.trim() || null;

  return { assigneeName, assigneeAvatar };
}

export function buildMembersByAssigneeId(members: ProjectMember[]) {
  const map = new Map<string, ProjectMember>();
  for (const member of members) {
    const userId = member.userId?.trim();
    const memberId = member.id?.trim();
    if (userId) {
      map.set(userId, member);
    }
    if (memberId) {
      map.set(memberId, member);
    }
  }
  return map;
}

export function getTasksStateMessage({
  isPending,
  isError,
  errorMessage,
  hasSearch,
  count,
}: {
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  hasSearch: boolean;
  count: number;
}) {
  if (isPending) return "Loading tasks...";
  if (isError) return errorMessage || (hasSearch ? "Failed to search tasks" : "Failed to load tasks");
  if (count === 0) return hasSearch ? "No tasks found matching your search" : "No tasks found for this project";
  return null;
}
