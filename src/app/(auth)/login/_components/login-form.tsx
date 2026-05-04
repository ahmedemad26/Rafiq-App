"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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

const REMEMBERED_EMAIL_KEY = "taskly.remembered_email";

export default function LoginForm() {
  //   Form
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: false },
  });

  //   Mutiation
  const { login, isPending, isSuccess } = useLogin();

  const isBusy = isPending || isSuccess;

  useEffect(() => {
    const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
    if (rememberedEmail) {
      form.setValue("email", rememberedEmail);
      form.setValue("remember", true);
    }
  }, [form]);

  // Function
  const onSubmit = (values: LoginValues) => {
    if (values.remember) {
      localStorage.setItem(REMEMBERED_EMAIL_KEY, values.email);
    } else {
      localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    }

    login({ email: values.email, password: values.password }, {
      onSuccess: () => {
        toast.success("Logged in successfully");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-7">
        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold tracking-widest uppercase text-slate-mid">
                Email
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="yourname@company.com"
                  {...field}
                  className="bg-surface-highest text-slate-dark"
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
              <FormLabel className="text-xs font-semibold tracking-widest uppercase text-slate-mid">
                Password
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  {...field}
                  className="bg-surface-highest text-slate-dark"
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <FormField
            control={form.control}
            name="remember"
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                  className="border-slate-mid/60"
                />
                <Label
                  htmlFor="remember"
                  className="text-sm font-semibold tracking-wider uppercase text-slate-dark"
                >
                  Remember Me
                </Label>
              </div>
            )}
          />
          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-brand-primary"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isBusy}
          className="w-full rounded-lg bg-brand-primary py-6 font-semibold text-white transition-all hover:opacity-90 disabled:opacity-70"
        >
          <span className="inline-flex min-h-5 items-center justify-center gap-2">
            {isBusy ? (
              <>
                <Loader2 className="h-5 w-5 shrink-0 animate-spin" aria-hidden />
                <span>Log In…</span>
              </>
            ) : (
              <>
                <span className="inline-flex items-center md:hidden">
                  Sign In
                  <MoveRight className="ms-1 h-4 w-4" aria-hidden />
                </span>
                <span className="hidden md:inline">Log In</span>
              </>
            )}
          </span>
        </Button>
      </form>
    </Form>
  );
}
