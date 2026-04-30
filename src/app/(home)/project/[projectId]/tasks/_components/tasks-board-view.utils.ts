import type { DragEndEvent } from "@dnd-kit/core";
import type { TaskStatus } from "@/lib/constants/task-status";
import type { DropStatusData, ResolveDropStatus } from "../types/tasks-board-view.type";

export function initialsFromName(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "NA";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function formatDueDateShort(value: string | null): string {
  if (!value?.trim()) return "No due date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No due date";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

export const resolveDropStatus: ResolveDropStatus = (event: DragEndEvent): TaskStatus | null => {
  const overData = event.over?.data?.current as DropStatusData | undefined;
  if (overData?.status) return overData.status;
  return null;
};
