export const TASK_STATUSES = [
  "TO_DO",
  "IN_PROGRESS",
  "BLOCKED",
  "IN_REVIEW",
  "READY_FOR_QA",
  "REOPENED",
  "READY_FOR_PRODUCTION",
  "DONE",
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export function taskStatusLabel(status: TaskStatus): string {
  return status.replaceAll("_", " ");
}
