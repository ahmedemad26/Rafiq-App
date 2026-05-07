import { memo } from "react";
import { taskStatusLabel } from "@/lib/constants/task-status";
import type { ProjectMember } from "@/lib/types/member";
import type { ProjectTask } from "@/lib/types/project-tasks";
import { cn } from "@/lib/utils/utils";
import {
  formatDueDate,
  getTaskAssigneeDetails,
  initialsFromName,
  normalizedStatus,
  statusBadgeClass,
} from "../utils/tasks-list-table.helpers";

function TaskRow({
  task,
  membersByAssigneeId,
  onOpenTask,
}: {
  task: ProjectTask;
  membersByAssigneeId: Map<string, ProjectMember>;
  onOpenTask: (taskId: string) => void;
}) {
  const { assigneeName, assigneeAvatar } = getTaskAssigneeDetails(task, membersByAssigneeId);
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

export const MemoTaskRow = memo(TaskRow);
