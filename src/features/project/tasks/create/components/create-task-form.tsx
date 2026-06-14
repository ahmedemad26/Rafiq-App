"use client";

import { useEffect, useMemo, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver, type SubmitHandler } from "react-hook-form";
import {
  createTaskSchema,
  type CreateTaskValues,
} from "@/lib/schemes/products-shema/create-task.schema";
import { useProjectMembers } from "@/features/project/members/hooks/use-project-members";
import CreateTaskFormFields from "./create-task-form-fields";
import type {
  CreateTaskFormProps,
  CreateTaskFormValues,
} from "../types/create-task-form";
import { useProjectEpicsForSelect } from "../hooks/use-project-epics-for-select";
import { useCreateTask } from "../hooks/use-create-task";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_REGEX.test(value.trim());
}

export default function CreateTaskForm({
  projectId,
  initialEpicId,
  initialStatus,
  onSuccess,
  onCancel,
}: CreateTaskFormProps) {
  const prefilledEpic = useRef(false);

  const form = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema) as Resolver<CreateTaskFormValues>,
    defaultValues: {
      project_id: projectId,
      title: "",
      epic_id: initialEpicId && isUuid(initialEpicId) ? initialEpicId : "",
      description: "",
      assignee_id: "",
      due_date: "",
      status: initialStatus ?? "TO_DO",
    },
    mode: "onChange",
  });

  const { data: epicsResult, isPending: isEpicsLoading } = useProjectEpicsForSelect(projectId);
  const epics = useMemo(() => epicsResult?.data ?? [], [epicsResult?.data]);

  const { data: members = [], isPending: isMembersLoading } = useProjectMembers(projectId);
  const { mutate, isPending } = useCreateTask(projectId);

  useEffect(() => {
    if (prefilledEpic.current) return;
    if (!initialEpicId || !isUuid(initialEpicId)) return;
    if (!epics.length) return;
    if (!epics.some((e) => e.id === initialEpicId)) return;
    form.setValue("epic_id", initialEpicId);
    prefilledEpic.current = true;
  }, [epics, form, initialEpicId]);

  const descriptionLen = form.watch("description")?.length ?? 0;

  const onSubmit: SubmitHandler<CreateTaskFormValues> = (values) => {
    const dueLocal = values.due_date?.trim();
    console.log("[form] dueLocal:", dueLocal);
    const due_date = dueLocal
      ? (() => {
          const d = new Date(dueLocal);
          return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
        })()
      : undefined;

    const payload: CreateTaskValues = createTaskSchema.parse({
      ...values,
      epic_id: values.epic_id?.trim() || undefined,
      assignee_id: values.assignee_id?.trim() || undefined,
      description: values.description?.trim() || undefined,
      due_date,
    });

    mutate(payload, {
      onSuccess: () => {
        form.reset({
          project_id: projectId,
          title: "",
          epic_id: "",
          description: "",
          assignee_id: "",
          due_date: "",
          status: initialStatus ?? "TO_DO",
        });
        prefilledEpic.current = false;
        onSuccess?.();
      },
    });
  };

  return (
    <CreateTaskFormFields
      form={form}
      epics={epics}
      members={members}
      isPending={isPending}
      isEpicsLoading={isEpicsLoading}
      isMembersLoading={isMembersLoading}
      descriptionLen={descriptionLen}
      onSubmit={form.handleSubmit(onSubmit)}
      onCancel={onCancel}
    />
  );
}


