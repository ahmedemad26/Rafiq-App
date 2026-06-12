import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .regex(/^\S+$/, "Password cannot contain spaces"),
  remember: z.boolean(),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type LoginCredentials = Omit<LoginValues, "remember">;
