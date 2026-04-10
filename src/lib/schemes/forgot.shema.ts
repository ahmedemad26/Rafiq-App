import * as z from "zod";

export const forgotSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type ForgotPasswordValues = z.infer<typeof forgotSchema>;
