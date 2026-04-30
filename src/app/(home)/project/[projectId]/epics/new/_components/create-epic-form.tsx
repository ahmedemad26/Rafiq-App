"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
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
  createEpicSchema,
  type CreateEpicValues,
} from "@/lib/schemes/products-shema/create-epic.shema";
import { cn } from "@/lib/utils/utils";
import { useProjectMembers } from "../../../members/_hooks/use-project-members";
import { useCreateEpic } from "../_hooks/use-create-epic";

const inputSurfaceClass =
  "rounded-lg border-0 bg-[#EEF2FF] px-3.5 py-2.5 text-[15px] text-slate-900 shadow-none placeholder:text-slate-400/90 focus-visible:bg-[#E6ECFC] focus-visible:ring-2 focus-visible:ring-[#003380]/20";

type CreateEpicFormProps = {
  projectId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export default function CreateEpicForm({
  projectId,
  onSuccess,
  onCancel,
}: CreateEpicFormProps) {
  const form = useForm<CreateEpicValues>({
    resolver: zodResolver(createEpicSchema),
    defaultValues: {
      title: "",
      description: "",
      assignee_id: "",
      deadline: "",
      project_id: projectId,
    },
    mode: "onChange",
  });

  const descriptionLen = form.watch("description")?.length ?? 0;
  const { data: members = [], isPending: isMembersLoading } = useProjectMembers(projectId);
  const { mutate, isPending } = useCreateEpic();

  const onSubmit: SubmitHandler<CreateEpicValues> = (values) => {
    const payload: CreateEpicValues = createEpicSchema.parse({
      ...values,
      assignee_id: values.assignee_id || undefined,
      deadline: values.deadline || undefined,
    });
    mutate(payload, {
      onSuccess: () => {
        form.reset({
          title: "",
          description: "",
          assignee_id: "",
          deadline: "",
          project_id: projectId,
        });
        onSuccess?.();
      },
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.06)]">
      <div className="px-6 pb-6 pt-6 sm:px-8 sm:pb-7 sm:pt-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <FormItem className="space-y-1.5">
                  <Label
                    htmlFor="epic-title"
                    className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-600"
                  >
                    Title<span className="text-red-500">*</span>
                  </Label>
                  <FormControl>
                    <Input
                      id="epic-title"
                      placeholder="e.g. Structural Foundation Phase"
                      className={cn("h-11 rounded-lg", inputSurfaceClass)}
                      {...field}
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
                      htmlFor="epic-description"
                      className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-600"
                    >
                      Description
                    </Label>
                    <span className="text-xs font-normal text-slate-400">Optional</span>
                  </div>
                  <div className="relative">
                    <FormControl>
                      <textarea
                        id="epic-description"
                        {...field}
                        maxLength={500}
                        rows={4}
                        placeholder="Describe the scope and objectives of this epic..."
                        className={cn(
                          "min-h-[112px] w-full resize-none pb-8 sm:min-h-[120px]",
                          inputSurfaceClass
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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                name="assignee_id"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <Label
                      htmlFor="epic-assignee"
                      className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-600"
                    >
                      Assignee
                    </Label>
                    <FormControl>
                      <select
                        id="epic-assignee"
                        className={cn("h-11 w-full", inputSurfaceClass)}
                        value={field.value ?? ""}
                        onChange={(event) => field.onChange(event.target.value)}
                        disabled={isMembersLoading}
                      >
                        <option value="">Select a member...</option>
                        {members.map((member) => (
                          <option key={member.id} value={member.userId ?? ""} disabled={!member.userId}>
                            {member.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="deadline"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <Label
                      htmlFor="epic-deadline"
                      className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-600"
                    >
                      Deadline
                    </Label>
                    <FormControl>
                      <Input
                        id="epic-deadline"
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        className={cn("h-11", inputSurfaceClass)}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-2 h-px bg-slate-200/80" role="presentation" />

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                size="default"
                className="h-9 justify-center px-0 text-sm font-semibold text-slate-600 hover:bg-transparent hover:text-[#082456]"
                onClick={() => {
                  form.reset();
                  onCancel?.();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="brand"
                size="default"
                disabled={isPending}
                className="h-10 min-w-[140px] rounded-lg bg-[#003380]! px-5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(0,51,128,0.28)] hover:bg-[#002d6e]! hover:opacity-100!"
              >
                {isPending ? "Creating..." : "Create Epic"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
