"use client";

import Link from "next/link";
import type { ProjectTask } from "@/lib/types/project-tasks";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/utils";
import { formatDueDate, initialsFromName } from "./epic-details-utils";

function TaskStatusIcon() {
  return (
    <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white">
      <span className="size-2.5 rounded-full bg-slate-300" />
    </span>
  );
}

export function EpicDetailsTasksSection(props: {
  projectId: string;
  epicId: string;
  onClose: () => void;
  onTaskClick: (taskId: string) => void;
  tasks: ProjectTask[];
  isLoading: boolean;
  isError: boolean;
}) {
  const { projectId, epicId, onClose, onTaskClick, tasks, isLoading, isError } = props;

  return (
    <div className="space-y-3 border-t border-slate-100 pt-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#11284d]">Tasks</h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-auto p-0 text-sm font-semibold text-[#003380] hover:bg-transparent hover:text-[#002d6e]"
          asChild
        >
          <Link
            href={`/project/${projectId}/tasks/new?epicId=${encodeURIComponent(epicId)}`}
            onClick={onClose}
          >
            + Add Task
          </Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="animate-pulse rounded-lg border border-slate-100 p-3">
                <div className="mb-2 h-4 w-2/3 rounded bg-slate-200" />
                <div className="h-3 w-1/3 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : null}

        {!isLoading && isError ? (
          <p className="px-4 py-6 text-center text-sm text-slate-500">Failed to load tasks</p>
        ) : null}

        {!isLoading && !isError && tasks.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-slate-500">
            No tasks found for this epic
          </p>
        ) : null}

        {!isLoading && !isError && tasks.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {tasks.map((task) => {
              const taskTitle = task.title?.trim() || "Untitled task";
              const taskAssigneeName = task.assignee_name?.trim() || "Unassigned";
              const taskAssigneeAvatar = task.assignee_avatar?.trim() || null;
              return (
                <li
                  key={task.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onTaskClick(task.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onTaskClick(task.id);
                    }
                  }}
                  className="flex cursor-pointer items-center gap-3 px-4 py-3"
                >
                  <TaskStatusIcon />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#11284d]">{taskTitle}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-full text-[9px] font-bold",
                          taskAssigneeAvatar
                            ? "bg-slate-200 text-transparent"
                            : "bg-[#E8EEF8] text-[#003380]",
                        )}
                      >
                        {taskAssigneeAvatar ? (
                          <span
                            className="size-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${taskAssigneeAvatar})` }}
                            aria-hidden
                          />
                        ) : (
                          initialsFromName(taskAssigneeName)
                        )}
                      </span>
                      <span className="truncate text-xs text-slate-500">{taskAssigneeName}</span>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                      Due Date
                    </p>
                    <p className="text-xs font-medium text-slate-600">
                      {formatDueDate(task.due_date)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

