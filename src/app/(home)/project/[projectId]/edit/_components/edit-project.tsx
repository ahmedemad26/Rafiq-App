"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Check, Lightbulb, Pencil } from "lucide-react";
import { useEffect, useMemo } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  updateProjectSchema,
  type UpdateProjectValues,
} from "@/lib/schemes/products-shema/update-project.shema";
import { cn } from "@/lib/utils/utils";
import { useProjectDetails } from "../_hooks/use-project-details";
import { useUpdateProject } from "../_hooks/use-update-project";

const inputSurfaceClass =
  "rounded-lg border-0 bg-[#EEF2FF] px-3.5 py-2.5 text-[15px] text-slate-900 shadow-none placeholder:text-slate-400/90 focus-visible:bg-[#E6ECFC] focus-visible:ring-2 focus-visible:ring-[#003380]/20";

type EditProjectProps = {
  projectId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  onNameChange?: (name: string) => void;
};

export default function EditProject({
  projectId,
  onSuccess,
  onCancel,
  onNameChange,
}: EditProjectProps) {
  const router = useRouter();
  const form = useForm<UpdateProjectValues>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: {
      name: "",
      description: "",
    },
    mode: "onChange",
  });

  const { data: project, isPending: isProjectLoading, isError, error } = useProjectDetails(projectId);
  const { mutate, isPending } = useUpdateProject();
  const descriptionLen = form.watch("description")?.length ?? 0;
  const errorMessage = useMemo(
    () => (error instanceof Error ? error.message : "Failed to load project details"),
    [error],
  );

  useEffect(() => {
    if (!project) return;
    form.reset({
      name: project.name ?? "",
      description: project.description ?? "",
    });
  }, [form, project]);

  useEffect(() => {
    if (!isError) return;
    const normalized = errorMessage.toLowerCase();
    if (!normalized.includes("jwt expired") && !normalized.includes("unauthorized")) return;
    const callback = encodeURIComponent(`/project/${projectId}/edit`);
    router.replace(`/login?callbackUrl=${callback}`);
  }, [errorMessage, isError, projectId, router]);

  const onSubmit: SubmitHandler<UpdateProjectValues> = (values) => {
    mutate(
      { projectId, values },
      {
        onSuccess: () => {
          onSuccess?.();
        },
      },
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.06)]">
      <div className="px-6 pb-1 pt-6 sm:px-8 sm:pt-7">
        <header className="flex gap-4">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#DCE8FF]"
            aria-hidden
          >
            <span className="relative flex h-7 w-7 items-center justify-center">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#003380]">
                <Check className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
              </span>
              <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200/80">
                <Pencil className="size-1.5 text-[#003380]" strokeWidth={3.5} />
              </span>
            </span>
          </div>
          <div className="min-w-0 space-y-0.5">
            <h2 className="font-heading text-lg font-bold tracking-tight text-[#082456] sm:text-xl">
              Update Project Details
            </h2>
            <p className="text-sm leading-snug text-slate-500">
              Edit your project name and description.
            </p>
          </div>
        </header>

        <div className="my-5 h-px bg-slate-200/80" role="presentation" />

        {isError ? (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pb-5 sm:space-y-5 sm:pb-6"
          >
            <FormField
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <FormItem className="space-y-1.5">
                  <Label
                    htmlFor="project-title"
                    className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-600"
                  >
                    Project title<span className="text-red-500">*</span>
                  </Label>
                  <FormControl>
                    <Input
                      id="project-title"
                      placeholder="e.g. Q1 Product Launch"
                      className={cn("h-10 rounded-lg", inputSurfaceClass)}
                      {...field}
                      onChange={(event) => {
                        field.onChange(event);
                        onNameChange?.(event.target.value);
                      }}
                    />
                  </FormControl>
                  <div className="flex min-h-5 items-start gap-1.5">
                    {fieldState.error ? (
                      <AlertCircle
                        className="mt-0.5 size-4 shrink-0 text-destructive"
                        aria-hidden
                      />
                    ) : null}
                    <FormMessage className="text-sm leading-snug" />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              name="description"
              control={form.control}
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <Label
                      htmlFor="project-description"
                      className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-600"
                    >
                      Description
                    </Label>
                    <span className="text-xs font-normal text-slate-400">Optional</span>
                  </div>
                  <div className="relative">
                    <FormControl>
                      <textarea
                        id="project-description"
                        {...field}
                        maxLength={500}
                        rows={3}
                        placeholder="Provide a high-level overview of the project's architectural objectives and key milestones..."
                        className={cn(
                          "min-h-[88px] w-full resize-none pb-8 sm:min-h-[96px]",
                          inputSurfaceClass,
                        )}
                      />
                    </FormControl>
                    <p className="pointer-events-none absolute bottom-2 right-2.5 text-[11px] text-slate-400">
                      {descriptionLen} / 500 characters
                    </p>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col-reverse gap-3 pt-0 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                size="default"
                className="h-9 justify-center px-0 text-sm font-semibold text-slate-600 hover:bg-transparent hover:text-[#082456]"
                onClick={() => {
                  onCancel?.();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="brand"
                size="default"
                disabled={isPending || isProjectLoading}
                className="h-9 min-w-[140px] rounded-lg !bg-[#003380] px-5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(0,51,128,0.28)] hover:!bg-[#002d6e] hover:!opacity-100"
              >
                {isPending ? "Saving…" : "Save Project"}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <div className="flex gap-3 rounded-b-2xl bg-[#E8EEF8] px-6 py-2.5 sm:px-8">
        <Lightbulb
          className="mt-0.5 size-4 shrink-0 text-slate-500"
          aria-hidden
        />
        <p className="text-xs leading-snug text-slate-600 sm:text-[13px] sm:leading-relaxed">
          <span className="font-semibold text-slate-700">Pro Tip:</span> Keep names
          clear and concise to make your project list easier to scan.
        </p>
      </div>
    </div>
  );
}
