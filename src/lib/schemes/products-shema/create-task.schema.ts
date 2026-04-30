import { z } from "zod";
import { TASK_STATUSES, type TaskStatus } from "@/lib/constants/task-status";

export const createTaskSchema = z.object({
  project_id: z.string().uuid("Invalid project id"),
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title is too long"),
  epic_id: z.string().uuid("Invalid epic").or(z.literal("")).optional(),
  description: z.string().max(2000, "Description is too long").optional(),
  assignee_id: z.string().uuid("Invalid assignee id").or(z.literal("")).optional(),
  /** ISO 8601 string from client, or empty */
  due_date: z.string().optional(),
  status: z.enum(TASK_STATUSES).default("TO_DO" satisfies TaskStatus),
});

export type CreateTaskValues = z.infer<typeof createTaskSchema>;
