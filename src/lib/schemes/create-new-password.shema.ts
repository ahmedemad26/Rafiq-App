import * as z from "zod";



export const RESET_PASSWORD_CHECKS = [
  {
    label: "8-64 characters",
    test: (p: string) => p.length >= 8 && p.length <= 64,
  },
  {
    label: "Lowercase letter",
    test: (p: string) => /[a-z]/.test(p),
  },
  {
    label: "Uppercase letter",
    test: (p: string) => /[A-Z]/.test(p),
  },
  {
    label: "One digit",
    test: (p: string) => /[0-9]/.test(p),
  },
  {
    label: "Special character",
    test: (p: string) => /[!@#$%^&*]/.test(p),
  },
];

export const createNewPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(64, "Password cannot exceed 64 characters")
      .regex(/[a-z]/, "Must contain one lowercase letter")
      .regex(/[A-Z]/, "Must contain one uppercase letter")
      .regex(/[0-9]/, "Must contain one number")
      .regex(/[!@#$%^&*]/, "Must contain one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type CreateNewPasswordValues = z.infer<typeof createNewPasswordSchema>;
