import type { TaskStatus } from "@/lib/constants/task-status";

export type ProjectTask = {
  id: string;
  project_id?: string | null;
  task_id?: string | null;
  title: string | null;
  description?: string | null;
  due_date: string | null;
  created_at?: string | null;
  assignee_name: string | null;
  assignee_avatar: string | null;
  reporter_name?: string | null;
  reporter_avatar?: string | null;
  epic_id?: string | null;
  priority?: string | null;
  status?: TaskStatus | null;
};

