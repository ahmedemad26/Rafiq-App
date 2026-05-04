"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useSession } from "next-auth/react";
import { CalendarDays } from "lucide-react";
import { TASK_STATUSES, taskStatusLabel } from "@/lib/constants/task-status";
import { cn } from "@/lib/utils/utils";
import type { ProjectMember } from "@/lib/types/member";
import type { TaskCardProps } from "../types/tasks-board-view.type";
import { formatDueDateShort, initialsFromName } from "./tasks-board-view.utils";

function normalizeName(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function displayNameFromEmail(email: string): string {
  const localPart = email.split("@")[0] ?? "";
  if (!localPart.trim()) return email;
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

type SessionUserLike = {
  email?: string | null;
  name?: string | null;
  user_metadata?: { name?: string | null };
};

function normalizeEmail(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function resolveAssignedMember(task: TaskCardProps["task"], members: ProjectMember[]): ProjectMember | null {
  const taskAssigneeId = task.assignee_id?.trim() ?? "";
  const taskAssigneeName = normalizeName(task.assignee_name);
  const taskAssigneeEmail = normalizeEmail(task.assignee_email);

  return (
    members.find(
      (member) =>
        Boolean(
          taskAssigneeId && (member.id === taskAssigneeId || (member.userId?.trim() ?? "") === taskAssigneeId),
        ),
    ) ??
    members.find((member) => normalizeName(member.name) === taskAssigneeName) ??
    members.find((member) => normalizeEmail(member.email) === taskAssigneeEmail) ??
    null
  );
}

function resolveAssigneeName(
  task: TaskCardProps["task"],
  assignedMember: ProjectMember | null,
  user: SessionUserLike | undefined,
): string {
  const taskAssigneeEmail = normalizeEmail(task.assignee_email);
  const memberEmail = normalizeEmail(assignedMember?.email);
  const sessionEmail = normalizeEmail(user?.email);
  const sessionName = user?.user_metadata?.name?.trim() || user?.name?.trim() || "";

  const fallbackEmail = assignedMember?.email?.trim() || task.assignee_email?.trim() || "";
  const isCurrentUserAssignee =
    Boolean(sessionEmail) &&
    Boolean(taskAssigneeEmail || memberEmail) &&
    (sessionEmail === taskAssigneeEmail || sessionEmail === memberEmail);

  return (
    assignedMember?.name?.trim() ||
    task.assignee_name?.trim() ||
    (isCurrentUserAssignee ? sessionName : "") ||
    (fallbackEmail ? displayNameFromEmail(fallbackEmail) : "") ||
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
  const { data: session } = useSession();
  const assignedMember = resolveAssignedMember(task, members);
  const assigneeName = resolveAssigneeName(task, assignedMember, session?.user);
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
              initialsFromName(assigneeName)
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
