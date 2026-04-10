"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type SubmitHandler, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  createProjectSchema,
  type CreateProjectValues,
} from "@/lib/schemes/products-shema/add-project.shema";
import { useAddNewProject } from "../_hooks/use-add-new-project";

// props for add project
type AddProjectProps = {
  onSuccess?: () => void;
};

// add project component
export default function AddProject({ onSuccess }: AddProjectProps) {

  // Form
  const form = useForm<CreateProjectValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

    // Mutation
  const { mutate, isPending } = useAddNewProject();

  // Function
  const onSubmit: SubmitHandler<CreateProjectValues> = (values) => {
    mutate(values, () => {
      form.reset();
      onSuccess?.();
    });
  };

  return (
    <section className="w-full px-1 pb-1 pt-1 sm:px-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Project Name */}
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-sm font-medium text-slate-700">
                  Project name <span className="text-red-500">*</span>
                </FormLabel>

                <FormControl>
                  <Input
                    placeholder="Enter project name"
                    className="h-12 rounded-lg px-4 text-base"
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            name="description"
            control={form.control}
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-sm font-medium text-slate-700">
                  Project description <span className="text-red-500">*</span>
                </FormLabel>

                <FormControl>
                  <textarea
                    {...field}
                    placeholder="Enter project description"
                    className="min-h-[160px] w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-[#11284d] focus:ring-1 focus:ring-[#11284d]"
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit */}
          <Button
            type="submit"
            variant="brand"
            disabled={isPending}
            className="h-12 w-full text-base font-medium"
          >
            {isPending ? "Creating..." : "Add project"}
          </Button>
        </form>
      </Form>
    </section>
  );
}