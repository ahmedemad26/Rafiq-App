import type { UseFormReturn } from "react-hook-form";
import type { TaskStatus } from "@/lib/constants/task-status";
import type { ProjectEpic } from "@/lib/types/epics";
import type { ProjectMember } from "@/lib/types/member";
import type { CreateTaskValues } from "@/lib/schemes/products-shema/create-task.schema";

export type CreateTaskFormValues = Omit<CreateTaskValues, "due_date"> & {
  due_date: string;
};

export type CreateTaskFormProps = {
  projectId: string;
  initialEpicId?: string;
  initialStatus?: TaskStatus;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export type CreateTaskFormFieldsProps = {
  form: UseFormReturn<CreateTaskFormValues>;
  epics: ProjectEpic[];
  members: ProjectMember[];
  isPending: boolean;
  isEpicsLoading: boolean;
  isMembersLoading: boolean;
  descriptionLen: number;
  onSubmit: () => void;
  onCancel?: () => void;
};
