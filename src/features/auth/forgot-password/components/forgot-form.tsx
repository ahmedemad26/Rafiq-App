"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { forgotSchema, type ForgotPasswordValues } from "@/lib/schemes/forgot.shema";
import useForgotPassword from "../hooks/use-forgot-password";

export interface ForgotFormProps {
  cooldownLeft: number;
  onResetLinkSent: () => void;
}

export default function ForgotForm({ cooldownLeft, onResetLinkSent }: ForgotFormProps) {
  const { mutate: forgotPassword, isPending } = useForgotPassword();
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (values: ForgotPasswordValues) => {
    forgotPassword(values, {
      onSuccess: () => onResetLinkSent(),
      onError: (error) => toast.error(error.message),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold tracking-wide uppercase text-slate-mid">Email address</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  {...field}
                  className="rounded-lg bg-surface-highest text-slate-dark placeholder:text-slate-mid"
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isPending || cooldownLeft > 0}
          className="mt-5 w-full rounded-lg bg-brand-primary py-6 font-semibold text-white transition-all hover:opacity-90 disabled:opacity-70"
        >
          <span className="inline-flex items-center gap-2">
            Send Reset Link
            {isPending && <Loader2 className="h-5 w-5 animate-spin" />}
          </span>
        </Button>
      </form>
    </Form>
  );
}
