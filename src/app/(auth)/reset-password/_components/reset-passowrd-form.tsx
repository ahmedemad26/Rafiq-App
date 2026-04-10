"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Circle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils/utils";
import useResetPassword from "../_hooks/use-reset-passowrd";
import {
  createNewPasswordSchema,
  CreateNewPasswordValues,
  RESET_PASSWORD_CHECKS,
} from "@/lib/schemes/create-new-password.shema";


// Parse Access Token
const parseAccessToken = (searchParams: URLSearchParams) => {
  // 1. Query params
  const token =
    searchParams.get("access_token") ?? searchParams.get("token");

  if (token) return token;

  // 2. Hash params (client only)
  if (typeof window !== "undefined") {
    const hash = window.location.hash.replace("#", "");
    const hashParams = new URLSearchParams(hash);

    return hashParams.get("access_token") ?? "";
  }

  return "";
};


export default function ResetPasswordForm() {

  // Navigation
  const router = useRouter();

  // Search Params
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [accessToken, setAccessToken] = useState("");

  const parsedAccessToken = parseAccessToken(searchParams);

  useEffect(() => {
    setAccessToken(parsedAccessToken);
  }, [parsedAccessToken]);

  const { mutate: resetPassword, isPending } = useResetPassword(accessToken);

  const form = useForm<CreateNewPasswordValues>({
    resolver: zodResolver(createNewPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = form.watch("password");

  const onSubmit = (values: CreateNewPasswordValues) => {
    if (!accessToken) {
      toast.error("Invalid or missing reset link. Please request a new one.");
      return;
    }

    resetPassword(values, {
      onSuccess: () => {
        toast.success("Password updated successfully");
        setTimeout(() => router.push("/login"), 1500);
      },
      onError: (err) => {
        toast.error(err.message);
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        {/* Password */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold tracking-widest uppercase text-[var(--color-slate-mid)]">
                New Password
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    className="bg-[var(--color-surface-highest)] text-[var(--color-slate-dark)] pr-12"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 text-[var(--color-slate-mid)] hover:bg-[var(--color-surface)] hover:text-[var(--color-slate-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />


        {/* Confirm Password */}

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold tracking-widest uppercase text-[var(--color-slate-mid)]">
                Confirm Password
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your new password"
                    className="bg-[var(--color-surface-highest)] text-[var(--color-slate-dark)] pr-12"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 text-[var(--color-slate-mid)] hover:bg-[var(--color-surface)] hover:text-[var(--color-slate-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />


        {/* Security Requirements */}
        <div className="rounded-md bg-[var(--color-surface-highest)] p-4">
          <p className="mb-3 text-xs font-semibold tracking-widest uppercase text-[var(--color-slate-mid)]">
            Security Requirements
          </p>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {RESET_PASSWORD_CHECKS.map(({ label, test }) => {
              const valid = test(password);
              return (
                <div
                  key={label}
                  className={cn(
                    "flex items-center gap-2 text-xs",
                    valid
                      ? "text-[var(--color-primary)]"
                      : "text-[var(--color-slate-mid)]",
                  )}
                >
                  {valid ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <Circle className="h-3.5 w-3.5 shrink-0" />
                  )}
                  <span>{label}</span>
                </div>
              );
            })}
          </div>
        </div>


        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full py-6 bg-[var(--color-primary)] text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-70 transition-all"
        >
          <span className="inline-flex items-center gap-2">
            Update Password
            {isPending && <Loader2 className="h-5 w-5 animate-spin" />}
          </span>
        </Button>
      </form>
    </Form>
  );
}
