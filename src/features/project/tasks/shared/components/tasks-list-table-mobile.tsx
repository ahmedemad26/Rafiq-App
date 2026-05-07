import { EllipsisVertical } from "lucide-react";
import { taskStatusLabel } from "@/lib/constants/task-status";
import type { ProjectMember } from "@/lib/types/member";
import type { ProjectTask } from "@/lib/types/project-tasks";
import { cn } from "@/lib/utils/utils";
import {
  formatDueDate,
  getTaskAssigneeDetails,
  getTasksStateMessage,
  initialsFromName,
  normalizedStatus,
  statusBadgeClass,
} from "../utils/tasks-list-table.helpers";

type TasksListTableMobileProps = {
  data: ProjectTask[];
  membersByAssigneeId: Map<string, ProjectMember>;
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  hasSearch: boolean;
  onOpenTask: (taskId: string) => void;
};

export function TasksListTableMobile({
  data,
  membersByAssigneeId,
  isPending,
  isError,
  errorMessage,
  hasSearch,
  onOpenTask,
}: TasksListTableMobileProps) {
  const stateMessage = getTasksStateMessage({
    isPending,
    isError,
    errorMessage,
    hasSearch,
    count: data.length,
  });

  return (
    <div className="space-y-2 p-3 sm:hidden">
      {stateMessage ? (
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-6 text-center text-sm text-slate-500">
          {stateMessage}
        </div>
      ) : (
        data.map((task) => {
          const { assigneeName } = getTaskAssigneeDetails(task, membersByAssigneeId);
          const status = normalizedStatus(task.status);

          return (
            <button
              key={task.id}
              type="button"
              onClick={() => onOpenTask(task.id)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-left shadow-[0_1px_2px_rgba(15,23,42,0.05)]"
            >
              <div className="mb-1 flex items-start justify-between gap-2">
                <span className="text-[10px] font-medium text-slate-400 uppercase">{task.task_id ?? "TASK"}</span>
                <span className={cn("inline-flex rounded px-2 py-0.5 text-[10px] font-bold uppercase", statusBadgeClass(status))}>
                  {status ? taskStatusLabel(status) : "Unknown"}
                </span>
              </div>
              <p className="line-clamp-2 text-[32px] font-semibold leading-[1.15] text-[#11284d]">
                {task.title?.trim() || "Untitled task"}
              </p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <div className="inline-flex min-w-0 items-center gap-2">
                  <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-[#E8EEF8] text-[10px] font-bold text-[#003380]">
                    {initialsFromName(assigneeName)}
                  </span>
                  <div className="text-[11px] leading-tight">
                    <p className="font-semibold tracking-wide text-slate-400 uppercase">Due Date</p>
                    <p className="font-semibold text-[#11284d]">{formatDueDate(task.due_date)}</p>
                  </div>
                </div>
                <EllipsisVertical className="size-4 text-slate-400" />
              </div>
            </button>
          );
        })
      )}
    </div>
  );
}
