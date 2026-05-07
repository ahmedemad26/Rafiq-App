import { TASK_STATUSES, type TaskStatus } from "@/lib/constants/task-status";
import CreateTaskPageClient from "./create-task-page-client";

type CreateTaskPageProps = {
  projectId: string;
  epicId?: string;
  status?: string;
};

function toTaskStatus(value?: string): TaskStatus | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toUpperCase();
  return (TASK_STATUSES as readonly string[]).includes(normalized)
    ? (normalized as TaskStatus)
    : undefined;
}

export default function CreateTaskPage({ projectId, epicId, status }: CreateTaskPageProps) {
  return (
    <CreateTaskPageClient
      projectId={projectId}
      initialEpicId={epicId}
      initialStatus={toTaskStatus(status)}
    />
  );
}

