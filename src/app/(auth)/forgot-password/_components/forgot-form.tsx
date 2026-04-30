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
import useForgotPassword from "../_hooks/use-forgot";
import { useForm } from "react-hook-form";
import { ForgotPasswordValues, forgotSchema } from "@/lib/schemes/forgot.shema";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type ForgotFormProps = {
  cooldownLeft: number;
  onResetLinkSent: () => void;
};

export default function ForgotForm({
  cooldownLeft,
  onResetLinkSent,
}: ForgotFormProps) {
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
        onResetLinkSent();
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
              <FormLabel className="text-xs font-bold tracking-wide uppercase text-slate-mid">
                Email address
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  {...field}
                  className="rounded-lg bg-surface-highest text-slate-dark placeholder:text-slate-mid"
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />



        {/* Submit Button */}
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
