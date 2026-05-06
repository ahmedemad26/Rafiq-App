import type { TaskStatus } from "@/lib/constants/task-status";

export type DailyTaskStats = {
  day: string;
  statuses: Partial<Record<TaskStatus, number>>;
};

export type TasksCalendarStats = {
  daily: DailyTaskStats[];
  totals: Partial<Record<TaskStatus, number>>;
  total_tasks: number;
  done_tasks: number;
  overdue_tasks: number;
};

export type TasksCalendarStatsInput = {
  p_start_date: string;
  p_end_date: string;
  p_project_id: string | null;
  p_status: TaskStatus | null;
};

export type TasksPerProjectRow = {
  project_id: string;
  project_name: string;
  tasks_count: number;
};

export type TasksPerProjectInput = {
  p_start_date: string;
  p_end_date: string;
};
