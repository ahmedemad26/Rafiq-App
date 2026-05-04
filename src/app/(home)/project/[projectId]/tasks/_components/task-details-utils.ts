"use client";

import type { TaskStatus } from "@/lib/constants/task-status";
import { TASK_STATUSES } from "@/lib/constants/task-status";
import type { ProjectMember } from "@/lib/types/member";
import type { ProjectTask } from "@/lib/types/project-tasks";

export function formatDate(value: string | null | undefined): string {
  if (!value?.trim()) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function normalizeStatus(value: string | null | undefined): TaskStatus | null {
  if (!value?.trim()) return null;
  const normalized = value.trim().toUpperCase();
  return (TASK_STATUSES as readonly string[]).includes(normalized) ? (normalized as TaskStatus) : null;
}

export function statusBadgeClass(status: TaskStatus | null): string {
  if (status === "TO_DO") return "bg-slate-200 text-slate-700";
  if (status === "IN_PROGRESS") return "bg-[#CFE1FF] text-[#1A4D9E]";
  if (status === "DONE") return "bg-[#78E7AE] text-[#0D3C25]";
  if (status === "BLOCKED") return "bg-rose-200 text-rose-800";
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

export function memberOptionLabel(member: ProjectMember): string {
  const name = member.name?.trim() ?? "";
  const email = member.email?.trim() ?? "";
  if (name && email) return `${name} (${email})`;
  if (name) return name;
  if (email) return email;
  return "Member";
}

export function memberAssigneeValue(member: ProjectMember): string {
  return member.userId?.trim() || "";
}

export function resolveAssigneeDisplayName(task: ProjectTask | null | undefined, currentAssignee: ProjectMember | null): string {
  return (
    currentAssignee?.name?.trim() ||
    (currentAssignee?.email?.trim() ? nameFromEmail(currentAssignee.email) : "") ||
    task?.assignee_name?.trim() ||
    (task?.assignee_email?.trim() ? nameFromEmail(task.assignee_email) : "") ||
    "Unassigned"
  );
}
