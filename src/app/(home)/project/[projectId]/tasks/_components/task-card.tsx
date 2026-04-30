"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import type { TaskCardProps } from "../types/tasks-board-view.type";
import { formatDueDateShort, initialsFromName } from "./tasks-board-view.utils";

export default function TaskCard({ task, status, onOpenTask }: TaskCardProps) {
  const assigneeName = task.assignee_name?.trim() || "Unassigned";
  const assigneeAvatar = task.assignee_avatar?.trim() || null;
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
      </div>
    </article>
  );
}
