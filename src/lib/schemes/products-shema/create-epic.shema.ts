import { z } from "zod";

function normalizeDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export const createEpicSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title is required (minimum 3 characters)")
    .max(120, "Title is too long"),
  description: z.string().max(500, "Description is too long").optional(),
  assignee_id: z.string().uuid("Invalid assignee id").or(z.literal("")).optional(),
  project_id: z.string().uuid("Invalid project id"),
  deadline: z
    .string()
    .optional()
    .refine((value) => {
      if (!value) return true;
      const selectedDate = normalizeDate(value);
      if (Number.isNaN(selectedDate.getTime())) return false;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, "Deadline must be today or a future date"),
});

export type CreateEpicValues = z.infer<typeof createEpicSchema>;
