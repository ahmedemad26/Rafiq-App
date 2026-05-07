import type { ProjectTask } from "@/lib/types/project-tasks";

export type UpdateTaskStatusResult = { error: string } | { success: true };
export type UpdateTaskPatch = {
  status?: string;
  assignee_id?: string | null;
};
export type UpdateTaskResult = { error: string } | { success: true };

export type GetProjectTaskDetailsResult = { error: string } | { data: ProjectTask | null };

export type GetEpicTasksResult = { error: string } | { data: ProjectTask[] };

export type GetProjectTasksByStatusResult = { error: string } | { data: ProjectTask[]; total: number };

export type GetProjectTasksResult = { error: string } | { data: ProjectTask[]; total: number };
