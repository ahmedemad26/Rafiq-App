"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { UpdateEpicPatch } from "@/lib/types/actions/products/epics.type";
import type { ProjectEpic } from "@/lib/types/epics";
import type { ProjectMember } from "@/lib/types/member";
import { useProjectMembers } from "@/features/project";
import { useEpicTasks } from "../../shared/hooks/use-epic-tasks";
import { deadlineToInputValue } from "../../shared/components/epic-details-utils";
import { useUpdateEpic } from "./use-update-epic";

const TITLE_MIN = 3;
const TITLE_MAX = 120;
const DESC_MAX = 500;

export function useEpicDetailsDialogState({
  projectId,
  epic,
  open,
}: {
  projectId: string;
  epic: ProjectEpic | null;
  open: boolean;
}) {
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

  const resetFromEpic = useCallback((currentEpic: ProjectEpic) => {
    setTitle(currentEpic.title ?? "");
    setDescription(currentEpic.description ?? "");
    setDeadline(deadlineToInputValue(currentEpic.deadline));
    setAssigneeEditOpen(false);
  }, []);

  useEffect(() => {
    const latest = epicRef.current;
    if (open && latest) {
      resetFromEpic(latest);
    }
  }, [open, epic?.id, resetFromEpic]);

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

  const assignableMembers = members.filter((member: ProjectMember) => Boolean(member.userId?.trim()));
  const currentAssigneeSub = epic?.assignee?.sub?.trim() ?? "";
  const assigneeName = epic?.assignee?.name?.trim() || "Unassigned";
  const assigneeAvatarUrl =
    assignableMembers.find((member: ProjectMember) => member.userId === currentAssigneeSub)?.avatarUrl ?? null;

  const handleAssigneePick = async (userId: string | null) => {
    if (!epic || isPending) return;
    try {
      await patchEpic({ assignee_id: userId });
    } catch {
      // Assignee display is driven by server-backed epic prop.
    }
  };

  return {
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
    titleMax: TITLE_MAX,
    descriptionMax: DESC_MAX,
  };
}
