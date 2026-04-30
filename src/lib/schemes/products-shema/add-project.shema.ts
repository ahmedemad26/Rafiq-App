import { z } from "zod";

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(3, "Project name must be at least 3 characters")
    .max(100, "Project name is too long"),

  description: z
    .string()
    .max(500, "Description is too long"),
});

export type CreateProjectValues = z.infer<typeof createProjectSchema>;