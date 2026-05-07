"use client";

import Link from "next/link";
import type { ProjectEpic } from "@/lib/types/epics";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/utils";
import { useEpicDetailsDialogState } from "../hooks/use-epic-details-dialog-state";
import { EpicDetailsAssigneePicker } from "./epic-details-assignee-picker";
import { EpicDetailsTasksSection } from "./epic-details-tasks-section";

const inputSurfaceClass =
  "rounded-lg border-0 bg-[#EEF2FF] px-3.5 py-2.5 text-[15px] text-slate-900 shadow-none placeholder:text-slate-400/90 focus-visible:bg-[#E6ECFC] focus-visible:ring-2 focus-visible:ring-[#003380]/20";

type EpicDetailsDialogProps = {
  projectId: string;
  epic: ProjectEpic | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskOpen: (taskId: string) => void;
};

export default function EpicDetailsDialog({
  projectId,
  epic,
  open,
  onOpenChange,
  onTaskOpen,
}: EpicDetailsDialogProps) {
  const {
    title,
    description,
    deadline,
    isPending,
    isMembersLoading,
    members,
    assigneeEditOpen,
    setAssigneeEditOpen,
    assigneeAvatarUrl,
    assigneeName,
    handleAssigneePick,
    handleTitleBlur,
    handleDescriptionBlur,
    handleDeadlineChange,
    setTitle,
    setDescription,
    epicTasks,
    isTasksLoading,
    isTasksError,
    titleMax,
    descriptionMax,
  } = useEpicDetailsDialogState({
    projectId,
    epic,
    open,
  });

  if (!epic) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="max-h-[min(90vh,720px)] w-full max-w-[calc(100%-2rem)] overflow-y-auto sm:max-w-lg"
      >
        <DialogHeader className="space-y-3 text-left">
          <span className="inline-flex w-fit items-center rounded-md bg-emerald-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-emerald-700">
            {epic.epic_id || "EPIC"}
          </span>
          <DialogTitle className="sr-only">Epic details for {epic.epic_id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-1">
          <div className="space-y-1.5">
            <Label
              htmlFor="epic-detail-title"
              className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-600"
            >
              Title<span className="text-red-500">*</span>
            </Label>
            <Input
              id="epic-detail-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => void handleTitleBlur()}
              disabled={isPending}
              maxLength={titleMax}
              className={cn("h-11 rounded-lg", inputSurfaceClass)}
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="epic-detail-description"
              className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-600"
            >
              Description
            </Label>
            <textarea
              id="epic-detail-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => void handleDescriptionBlur()}
              disabled={isPending}
              maxLength={descriptionMax}
              rows={4}
              placeholder="No description provided"
              className={cn(
                "min-h-[100px] w-full resize-none",
                inputSurfaceClass,
                !description.trim() ? "text-slate-500" : "",
              )}
            />
            <p className="text-right text-[11px] text-slate-400">
              {description.length} / {descriptionMax}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-600">
                Assignee
              </Label>
              <EpicDetailsAssigneePicker
                epic={epic}
                isPending={isPending}
                isMembersLoading={isMembersLoading}
                members={members}
                open={assigneeEditOpen}
                setOpen={setAssigneeEditOpen}
                assigneeAvatarUrl={assigneeAvatarUrl}
                assigneeName={assigneeName}
                onPick={(userId) => void handleAssigneePick(userId)}
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="epic-detail-deadline"
                className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-600"
              >
                Deadline
              </Label>
              <Input
                id="epic-detail-deadline"
                type="date"
                value={deadline}
                onChange={(e) => void handleDeadlineChange(e.target.value)}
                disabled={isPending}
                className={cn(
                  "h-11 rounded-lg [&::-webkit-calendar-picker-indicator]:cursor-pointer",
                  inputSurfaceClass,
                )}
              />
            </div>
          </div>

          <EpicDetailsTasksSection
            projectId={projectId}
            epicId={epic.id}
            onClose={() => onOpenChange(false)}
            onTaskClick={(taskId) => {
              onOpenChange(false);
              onTaskOpen(taskId);
            }}
            tasks={epicTasks}
            isLoading={isTasksLoading}
            isError={isTasksError}
          />

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2">
            <Button
              type="button"
              variant="brand"
              size="sm"
              className="h-9 rounded-lg bg-[#003380]! px-4 text-xs font-semibold text-white hover:bg-[#002d6e]! hover:opacity-100!"
              asChild
            >
              <Link
                href={`/project/${projectId}/tasks/new?epicId=${encodeURIComponent(epic.id)}`}
                onClick={() => onOpenChange(false)}
              >
                Create New Task
              </Link>
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
