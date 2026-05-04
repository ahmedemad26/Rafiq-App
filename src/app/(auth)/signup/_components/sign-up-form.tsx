"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

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

import { registerSchema, RegisterValues, PASSWORD_CHECKS } from "@/lib/schemes/register-schema";
import useRegister from "../_hooks/use-register";
import { cn } from "@/lib/utils/utils";

export default function SignUpForm() {
  // Navigation
  const router = useRouter();

  // Mutation
  const { mutate: register, isPending } = useRegister();

  //Form
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      department: "",
      password: "",
      confirmPassword: "",
    },
  });


  // Watch Password
  const password = form.watch("password");

  // Function
  const onSubmit = (values: RegisterValues) => {
    register(values, {
      onSuccess: () => {
        setTimeout(() => router.push("/login"), 2000);
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-1">
        {form.formState.errors.root?.message && (
          <p className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {form.formState.errors.root.message}
          </p>
        )}

        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold tracking-widest uppercase text-slate-mid">
                Name
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your full name"
                  {...field}
                  className="bg-surface-highest text-slate-dark"
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

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

        {/* Department */}
        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold tracking-widest uppercase text-slate-mid">
                Job Title{" "}
                <span className="text-slate-light">
                  (Optional)
                </span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Project Manager"
                  {...field}
                  className="bg-surface-highest text-slate-dark"
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Passwords */}
        <div className="flex gap-3">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="text-xs font-semibold tracking-widest uppercase text-slate-mid">
                  Password
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Min 8 chars"
                    {...field}
                    className="bg-surface-highest text-slate-dark"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="text-xs font-semibold tracking-widest uppercase text-slate-mid">
                  Confirm
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Repeat"
                    {...field}
                    className="bg-surface-highest text-slate-dark"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>


        {/* Password Checks */}
        <div
          className="space-y-1 rounded-md bg-surface-highest p-3"
        >
          {PASSWORD_CHECKS.map(({ label, test }) => {
            const valid = test(password);
            return (
              <div
                key={label}
                className={cn(
                  "flex items-center gap-2 text-xs",
                  valid ? "text-brand-primary" : "text-slate-mid"
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



        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-brand-primary py-6 font-semibold text-white transition-all hover:opacity-90 disabled:opacity-70"
        >
          <span className="inline-flex items-center gap-2">
            <span>Create Account</span>
            {isPending && <Loader2 className="h-5 w-5 animate-spin" />}
          </span>
        </Button>


      </form>
    </Form>
  );
}
