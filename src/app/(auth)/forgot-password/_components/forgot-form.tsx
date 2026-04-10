"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import React from "react";
import useForgotPassword from "../_hooks/use-forgot";
import { useForm } from "react-hook-form";
import { ForgotPasswordValues, forgotSchema } from "@/lib/schemes/forgot.shema";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Props
type ForgotFormProps = {
  onSent?: (email: string) => void;
};

export default function ForgotForm({ onSent }: ForgotFormProps) {

  // Mutation
  const { mutate: forogotPassword, isPending } = useForgotPassword();

  //Form
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      email: "",
    },
  });

  // Function
  const onSubmit = (values: ForgotPasswordValues) => {
    forogotPassword(values, {
      onSuccess: () => {
        toast.success("Reset link sent successfully");
        onSent?.(values.email);
      },
      onError: (err) => {
        toast.error(err.message);
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
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
                  placeholder="Enter Your Email"
                  {...field}
                  className="bg-[var(--color-surface-highest)] text-[var(--color-slate-dark)]"
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full mt-5 py-6 bg-[var(--color-primary)] text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-70 transition-all"
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
