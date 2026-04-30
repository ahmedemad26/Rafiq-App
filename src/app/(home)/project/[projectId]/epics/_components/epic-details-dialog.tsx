"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { UpdateEpicPatch } from "@/lib/types/actions/products/epics.type";
import type { ProjectEpic } from "@/lib/types/epics";
import type { ProjectMember } from "@/lib/types/member";
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
import { useProjectMembers } from "../../members/_hooks/use-project-members";
import { useEpicTasks } from "../_hooks/use-epic-tasks";
import { useUpdateEpic } from "../_hooks/use-update-epic";
import { EpicDetailsAssigneePicker } from "./epic-details-assignee-picker";
import { EpicDetailsTasksSection } from "./epic-details-tasks-section";
import { deadlineToInputValue } from "./epic-details-utils";

const inputSurfaceClass =
  "rounded-lg border-0 bg-[#EEF2FF] px-3.5 py-2.5 text-[15px] text-slate-900 shadow-none placeholder:text-slate-400/90 focus-visible:bg-[#E6ECFC] focus-visible:ring-2 focus-visible:ring-[#003380]/20";

const TITLE_MIN = 3;
const TITLE_MAX = 120;
const DESC_MAX = 500;

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
  const { mutateAsync, isPending } = useUpdateEpic();
  const { data: members = [], isPending: isMembersLoading } = useProjectMembers(projectId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [assigneeEditOpen, setAssigneeEditOpen] = useState(false);
  const epicRef = useRef<ProjectEpic | null>(null);
  epicRef.current = epic;

  const epicId = epic?.id ?? null;
  const {
    data: epicTasks = [],
    isPending: isTasksLoading,
    isError: isTasksError,
  } = useEpicTasks({
    epicId,
    enabled: open,
  });

  const resetFromEpic = useCallback((e: ProjectEpic) => {
    setTitle(e.title ?? "");
    setDescription(e.description ?? "");
    setDeadline(deadlineToInputValue(e.deadline));
    setAssigneeEditOpen(false);
  }, []);

  useEffect(() => {
    const latest = epicRef.current;
    if (open && latest) {
      resetFromEpic(latest);
    }
  }, [open, epic?.id, resetFromEpic]);

  useEffect(() => {
    // handled inside `EpicDetailsAssigneePicker`
  }, [assigneeEditOpen]);

  const patchEpic = useCallback(
    async (patch: UpdateEpicPatch) => {
      if (!epicId) return;
      await mutateAsync({ epicId, patch });
    },
    [epicId, mutateAsync],
  );

  const handleTitleBlur = async () => {
    if (!epic || isPending) return;
    const next = title.trim();
    const prev = epic.title ?? "";
    if (next === prev) return;
    if (next.length < TITLE_MIN || next.length > TITLE_MAX) {
      setTitle(prev);
      return;
    }
    try {
      await patchEpic({ title: next });
    } catch {
      setTitle(prev);
    }
  };

  const handleDescriptionBlur = async () => {
    if (!epic || isPending) return;
    const next = description.trim();
    const prev = (epic.description ?? "").trim();
    if (next === prev) return;
    if (next.length > DESC_MAX) {
      setDescription(epic.description ?? "");
      return;
    }
    try {
      await patchEpic({
        description: next === "" ? null : next,
      });
    } catch {
      setDescription(epic.description ?? "");
    }
  };

  const handleDeadlineChange = async (value: string) => {
    if (!epic || isPending) return;
    const prevStr = deadlineToInputValue(epic.deadline);
    if (prevStr === value) return;

    setDeadline(value);
    try {
      await patchEpic({
        deadline: value.trim() === "" ? null : value.trim(),
      });
    } catch {
      setDeadline(prevStr);
    }
  };

  const assignableMembers = members.filter((m: ProjectMember) => m.userId);

  const handleAssigneePick = async (userId: string | null) => {
    if (!epic || isPending) return;
    try {
      await patchEpic({ assignee_id: userId });
    } catch {
      /* assignee display comes from epic prop; no local state to revert */
    }
  };

  if (!epic) {
    return null;
  }

  const currentAssigneeSub = epic?.assignee?.sub?.trim() ?? "";
  const assigneeName = epic.assignee?.name?.trim() || "Unassigned";
  const assigneeAvatarUrl =
    assignableMembers.find((m: ProjectMember) => m.userId === currentAssigneeSub)?.avatarUrl ??
    null;

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
              maxLength={TITLE_MAX}
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
              maxLength={DESC_MAX}
              rows={4}
              placeholder="No description provided"
              className={cn(
                "min-h-[100px] w-full resize-none",
                inputSurfaceClass,
                !description.trim() ? "text-slate-500" : "",
              )}
            />
            <p className="text-right text-[11px] text-slate-400">
              {description.length} / {DESC_MAX}
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
