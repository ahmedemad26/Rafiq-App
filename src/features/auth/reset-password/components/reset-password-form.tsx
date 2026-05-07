"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Circle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createNewPasswordSchema, type CreateNewPasswordValues, RESET_PASSWORD_CHECKS } from "@/lib/schemes/create-new-password.shema";
import { cn } from "@/lib/utils/utils";
import useResetPassword from "../hooks/use-reset-password";
import { parseAccessToken } from "../utils/parse-access-token";

export default function ResetPasswordForm() {
  const router = useRouter();
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
    defaultValues: { password: "", confirmPassword: "" },
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
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold tracking-widest uppercase text-slate-mid">New Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    className="bg-surface-highest pr-12 text-slate-dark"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword((previous) => !previous)}
                    className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 text-slate-mid hover:bg-surface-low hover:text-slate-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold tracking-widest uppercase text-slate-mid">Confirm Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your new password"
                    className="bg-surface-highest pr-12 text-slate-dark"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowConfirmPassword((previous) => !previous)}
                    className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 text-slate-mid hover:bg-surface-low hover:text-slate-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <div className="rounded-md bg-surface-highest p-4">
          <p className="mb-3 text-xs font-semibold tracking-widest uppercase text-slate-mid">Security Requirements</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {RESET_PASSWORD_CHECKS.map(({ label, test }) => {
              const valid = test(password);
              return (
                <div key={label} className={cn("flex items-center gap-2 text-xs", valid ? "text-brand-primary" : "text-slate-mid")}>
                  {valid ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <Circle className="h-3.5 w-3.5 shrink-0" />}
                  <span>{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-brand-primary py-6 font-semibold text-white transition-all hover:opacity-90 disabled:opacity-70"
        >
          <span className="inline-flex items-center gap-2">
            Update Password
            {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
          </span>
        </Button>
      </form>
    </Form>
  );
}
