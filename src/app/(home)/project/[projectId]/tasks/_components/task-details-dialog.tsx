"use client";

import { Link2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TaskDetailsPersonRow } from "./task-details-person-row";
import { TaskDetailsStatusPicker } from "./task-details-status-picker";
import { TaskDetailsAssigneePicker } from "./task-details-assignee-picker";
import { formatDate } from "./task-details-utils";
import { useTaskDetailsDialogState } from "./task-details-dialog-state";

type TaskDetailsDialogProps = {
  projectId: string;
  taskId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};


export default function TaskDetailsDialog({
  projectId,
  taskId,
  open,
  onOpenChange,
}: TaskDetailsDialogProps) {
  const {
    task,
    isPending,
    isError,
    popoverRef,
    status,
    statusMenuOpen,
    setStatusMenuOpen,
    assigneeMenuOpen,
    setAssigneeMenuOpen,
    isUpdating,
    isMembersPending,
    assignableMembers,
    effectiveAssigneeId,
    currentAssigneeValue,
    currentAssignee,
    assigneeDisplayName,
    reporterName,
    reporterAvatar,
    handleStatusChange,
    handleAssigneeChange,
  } = useTaskDetailsDialogState({
    projectId,
    taskId,
    open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[min(92vh,760px)] w-full max-w-[calc(100%-1.5rem)] overflow-y-auto rounded-md p-0 sm:max-w-[980px]"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Task Details</DialogTitle>
        </DialogHeader>

        {isPending ? (
          <div className="space-y-4 p-6">
            <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
            <div className="h-8 w-2/3 animate-pulse rounded bg-slate-200" />
            <div className="h-28 animate-pulse rounded bg-slate-100" />
            <div className="h-28 animate-pulse rounded bg-slate-100" />
          </div>
        ) : null}

        {!isPending && isError ? (
          <p className="px-6 py-8 text-sm text-slate-600">Failed to load task details</p>
        ) : null}

        {!isPending && !isError && !task ? <p className="px-6 py-8 text-sm text-slate-600">Task not found</p> : null}

        {!isPending && !isError && task ? (
          <div className="grid min-h-[620px] grid-cols-1 divide-y sm:grid-cols-[1.75fr_1fr] sm:divide-x sm:divide-y-0">
            <section className="flex min-h-full flex-col">
              <div className="space-y-4 p-6">
                <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded bg-[#E8EEF8] px-2 py-1 text-[11px] font-bold tracking-[0.08em] text-[#003380] uppercase">
                  {task.task_id?.trim() || "TASK"}
                </span>
                {task.epic_id?.trim() ? (
                  <span className="text-sm font-medium text-slate-500">{task.epic_id}</span>
                ) : null}
                </div>

                <h2 className="text-[44px] font-bold leading-[1.05] text-[#10294D]">
                  {task.title?.trim() || "Untitled task"}
                </h2>
              </div>

              <div className="space-y-2 border-t border-slate-200 px-6 py-5">
                <p className="text-[10px] font-bold tracking-[0.08em] text-slate-500 uppercase">Description</p>
                <p className="whitespace-pre-wrap text-[24px] leading-[1.7] text-slate-700">
                  {task.description?.trim() || "No description provided"}
                </p>
              </div>

              <div className="mt-auto flex items-center justify-between border-t border-slate-200 bg-[#F4F7FF] px-6 py-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
                >
                  <Link2 className="size-3.5" />
                  Copy link
                </button>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="inline-flex h-8 items-center justify-center rounded bg-[#D9E4FF] px-4 text-sm font-semibold text-[#10294D] hover:bg-[#cbd9ff]"
                >
                  Close
                </button>
              </div>
            </section>

            <aside className="space-y-6 bg-[#EEF1FB] p-6" ref={popoverRef}>
              <TaskDetailsStatusPicker
                status={status}
                open={statusMenuOpen}
                setOpen={(next) => {
                  setAssigneeMenuOpen(false);
                  setStatusMenuOpen(next);
                }}
                isPending={isUpdating}
                onChange={(next) => void handleStatusChange(next)}
              />

              <TaskDetailsAssigneePicker
                open={assigneeMenuOpen}
                setOpen={(next) => {
                  setStatusMenuOpen(false);
                  setAssigneeMenuOpen(next);
                }}
                isPending={isUpdating}
                isMembersPending={isMembersPending}
                assignableMembers={assignableMembers}
                effectiveAssigneeId={effectiveAssigneeId}
                currentAssigneeValue={currentAssigneeValue}
                triggerContent={
                  <TaskDetailsPersonRow
                    label="Assignee"
                    name={assigneeDisplayName}
                    avatar={currentAssignee?.avatarUrl?.trim() || null}
                  />
                }
                onChange={(assigneeId) => void handleAssigneeChange(assigneeId)}
              />

              <TaskDetailsPersonRow
                label="Reporter"
                name={reporterName}
                avatar={reporterAvatar}
              />

              <div className="border-t border-slate-300 pt-4 text-sm">
                <div className="flex items-center justify-between gap-2 py-1.5">
                  <span className="text-slate-500">Due Date</span>
                  <span className="font-semibold text-[#11284d]">{formatDate(task.due_date)}</span>
                </div>
                <div className="flex items-center justify-between gap-2 py-1.5">
                  <span className="text-slate-500">Created At</span>
                  <span className="font-semibold text-[#11284d]">{formatDate(task.created_at ?? null)}</span>
                </div>
              </div>
            </aside>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

