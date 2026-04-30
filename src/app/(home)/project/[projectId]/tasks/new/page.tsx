import CreateTaskPageClient from "./_components/create-task-page-client";
import { TASK_STATUSES, type TaskStatus } from "@/lib/constants/task-status";

type CreateNewTaskPageProps = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ epicId?: string; status?: string }>;
};

function toTaskStatus(value?: string): TaskStatus | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toUpperCase();
  return (TASK_STATUSES as readonly string[]).includes(normalized)
    ? (normalized as TaskStatus)
    : undefined;
}

export default async function CreateNewTaskPage({
  params,
  searchParams,
}: CreateNewTaskPageProps) {
  const { projectId } = await params;
  const { epicId, status } = await searchParams;
  const initialStatus = toTaskStatus(status);

  return (
    <CreateTaskPageClient
      projectId={projectId}
      initialEpicId={epicId}
      initialStatus={initialStatus}
    />
  );
}
