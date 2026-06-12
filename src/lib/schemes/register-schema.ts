import * as z from "zod";


export const PASSWORD_CHECKS = [
  {
    label: "No spaces",
    test: (p: string) => !/\s/.test(p),
  },
  {
    label: "At least 8 characters",
    test: (p: string) => p.length >= 8,
  },
  {
    label: "One uppercase, lowercase, and digit",
    test: (p: string) => /[A-Z]/.test(p) && /[a-z]/.test(p) && /[0-9]/.test(p),
  },
  {
    label: "One special character",
    test: (p: string) => /[!@#$%^&*]/.test(p),
  },
];

// Register Schema
export const registerSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters").max(50),
    email: z.string().email("Invalid email address"),
    department: z.string().optional(),
    password: z
      .string()
      .regex(/^\S+$/, "Password cannot contain spaces")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain one uppercase letter")
      .regex(/[a-z]/, "Must contain one lowercase letter")
      .regex(/[0-9]/, "Must contain one number")
      .regex(/[!@#$%^&*]/, "Must contain one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterValues = z.infer<typeof registerSchema>;
