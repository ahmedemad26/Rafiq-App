"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, MoveRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { loginSchema, LoginValues } from "@/lib/schemes/auth.shcema";
import useLogin from "../_hooks/use-login";
import { Label } from "@/components/ui/label";

export default function LoginForm() {
  // Navigation
  const router = useRouter();

  //   Form
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  //   Mutiation
  const { login, isPending } = useLogin();

  // Function
  const onSubmit = (values: LoginValues) => {
    login(values, {
      onSuccess: () => {
        toast.success("Logged in successfully");
        setTimeout(() => router.push("/"), 2000);
      },
      onError: (err) => {
        toast.error(err.message);
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold tracking-widest uppercase text-[var(--color-slate-mid)]">
                Email
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="yourname@company.com"
                  {...field}
                  className="bg-[var(--color-surface-highest)] text-[var(--color-slate-dark)]"
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Password */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold tracking-widest uppercase text-[var(--color-slate-mid)]">
                Password
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  {...field}
                  className="bg-[var(--color-surface-highest)] text-[var(--color-slate-dark)]"
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox id="remember" />
            <Label
              htmlFor="remember"
              className="text-sm text-[var(--color-slate-mid)]"
            >
              Remember Me
            </Label>
          </div>
          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-[var(--color-primary)]"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full py-6 bg-[var(--color-primary)] text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-70 transition-all"
        >
          <span className="inline-flex items-center gap-2">
            <span>
              {/* Mobile */}
              <span className=" flex md:hidden">
                Sign In
                <MoveRight className="ms-1" />
              </span>

              {/* DeskTop */}
              <span className="hidden md:inline">
                Log In
                {isPending && <Loader2 className="h-5 w-5 animate-spin" />}
              </span>
            </span>
          </span>
        </Button>
      </form>
    </Form>
  );
}
