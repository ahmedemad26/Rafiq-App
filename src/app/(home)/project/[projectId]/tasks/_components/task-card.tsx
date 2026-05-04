"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarDays } from "lucide-react";
import { TASK_STATUSES, taskStatusLabel } from "@/lib/constants/task-status";
import { cn, getInitials } from "@/lib/utils/utils";
import type { ProjectMember } from "@/lib/types/member";
import type { TaskCardProps } from "../types/tasks-board-view.type";
import { formatDueDateShort } from "./tasks-board-view.utils";

function nameFromEmail(email: string): string {
  const local = email.split("@")[0]?.trim() ?? "";
  if (!local) return email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function resolveAssignedMember(task: TaskCardProps["task"], members: ProjectMember[]): ProjectMember | null {
  const taskAssigneeId = task.assignee_id?.trim() ?? "";

  return (
    members.find(
      (member) =>
        Boolean(
          taskAssigneeId &&
            ((member.userId?.trim() ?? "") === taskAssigneeId || member.id.trim() === taskAssigneeId),
        ),
    ) ?? null
  );
}

function resolveAssigneeName(
  task: TaskCardProps["task"],
  assignedMember: ProjectMember | null,
): string {
  const memberEmail = assignedMember?.email?.trim() ?? "";
  const taskEmail = task.assignee_email?.trim() ?? "";
  return (
    assignedMember?.name?.trim() ||
    (memberEmail ? nameFromEmail(memberEmail) : "") ||
    task.assignee_name?.trim() ||
    (taskEmail ? nameFromEmail(taskEmail) : "") ||
    "Unassigned"
  );
}

export default function TaskCard({
  task,
  status,
  members = [],
  onOpenTask,
  onChangeTaskStatus,
}: TaskCardProps) {
  const assignedMember = resolveAssignedMember(task, members);
  const assigneeName = resolveAssigneeName(task, assignedMember);
  const assigneeAvatar = assignedMember?.avatarUrl?.trim() || task.assignee_avatar?.trim() || null;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    over,
  } = useSortable({
    id: task.id,
    data: {
      taskId: task.id,
      status,
    },
  });

  return (
    <article
      ref={setNodeRef}
      onClick={() => {
        if (!isDragging) onOpenTask(task.id);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenTask(task.id);
        }
      }}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "cursor-pointer rounded-lg border border-slate-200 bg-white p-3",
        isDragging ? "z-20 opacity-70 shadow-lg" : "",
        over ? "ring-1 ring-blue-300" : "",
      )}
      {...attributes}
      {...listeners}
    >
      <p className="line-clamp-2 text-sm font-semibold leading-5 text-[#11284d]">
        {task.title?.trim() || "Untitled task"}
      </p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.06em] text-slate-400 uppercase">
          <CalendarDays className="size-3" />
          {formatDueDateShort(task.due_date)}
        </span>
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <span
            className={cn(
              "inline-flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-full text-[9px] font-bold",
              assigneeAvatar ? "bg-slate-200 text-transparent" : "bg-[#E8EEF8] text-[#003380]",
            )}
            title={assigneeName}
          >
            {assigneeAvatar ? (
              <span
                className="size-full bg-cover bg-center"
                style={{ backgroundImage: `url(${assigneeAvatar})` }}
                aria-hidden
              />
            ) : (
              getInitials(assigneeName)
            )}
          </span>

          <span className="max-w-[110px] truncate text-[11px] font-medium text-slate-600" title={assigneeName}>
            {assigneeName}
          </span>
        </span>
      </div>
      <div className="mt-2 sm:hidden">
        <select
          value={status}
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          onChange={(event) => {
            const nextStatus = event.target.value;
            if (nextStatus === status) return;
            onChangeTaskStatus(task.id, status, nextStatus as typeof status);
          }}
          className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-[11px] font-semibold text-slate-700"
        >
          {TASK_STATUSES.map((item) => (
            <option key={item} value={item}>
              {taskStatusLabel(item)}
            </option>
          ))}
        </select>
      </div>
    </article>
  );
}
