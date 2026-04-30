"use client";

import { AlertCircle } from "lucide-react";
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
import { TASK_STATUSES, taskStatusLabel } from "@/lib/constants/task-status";
import type { ProjectEpic } from "@/lib/types/epics";
import { cn } from "@/lib/utils/utils";
import type { CreateTaskFormFieldsProps } from "../../../../../../../lib/types/create-task-form";

const inputSurfaceClass =
  "rounded-lg border-0 bg-[#EEF2FF] px-3.5 py-2.5 text-[15px] text-slate-900 shadow-none placeholder:text-slate-400/90 focus-visible:bg-[#E6ECFC] focus-visible:ring-2 focus-visible:ring-[#003380]/20";

function formatEpicOptionLabel(epic: ProjectEpic): string {
  const raw = epic.title?.trim() || "";
  const title = raw.length > 100 ? `${raw.slice(0, 100)}...` : raw;
  const id = epic.epic_id?.trim() || "EPIC";
  return `${id} ${title}`.trim();
}

export default function CreateTaskFormFields({
  form,
  epics,
  members,
  isPending,
  isEpicsLoading,
  isMembersLoading,
  descriptionLen,
  onSubmit,
  onCancel,
}: CreateTaskFormFieldsProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.06)]">
      <div className="px-6 pb-6 pt-6 sm:px-8 sm:pb-7 sm:pt-7">
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-5">
            <FormField
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <FormItem className="space-y-1.5">
                  <Label
                    htmlFor="task-title"
                    className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-600"
                  >
                    Title<span className="text-red-500">*</span>
                  </Label>
                  <FormControl>
                    <Input
                      id="task-title"
                      placeholder="e.g., Finalize structural schematics"
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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                name="status"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <Label
                      htmlFor="task-status"
                      className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-600"
                    >
                      Status<span className="text-red-500">*</span>
                    </Label>
                    <FormControl>
                      <select
                        id="task-status"
                        className={cn("h-11 w-full", inputSurfaceClass)}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        disabled={isPending}
                      >
                        {TASK_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {taskStatusLabel(s)}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="assignee_id"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <Label
                      htmlFor="task-assignee"
                      className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-600"
                    >
                      Assignee
                    </Label>
                    <FormControl>
                      <select
                        id="task-assignee"
                        className={cn("h-11 w-full", inputSurfaceClass)}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        disabled={isMembersLoading || isPending}
                      >
                        <option value="">Select Team Member</option>
                        {members.map((member) => (
                          <option
                            key={member.id}
                            value={member.userId ?? ""}
                            disabled={!member.userId}
                          >
                            {member.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              name="epic_id"
              control={form.control}
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <Label
                    htmlFor="task-epic"
                    className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-600"
                  >
                    Epic
                  </Label>
                  <FormControl>
                    <select
                      id="task-epic"
                      className={cn("h-11 w-full", inputSurfaceClass)}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      disabled={isEpicsLoading || isPending}
                    >
                      <option value="">Select Epic Link</option>
                      {epics.map((epic) => (
                        <option key={epic.id} value={epic.id}>
                          {formatEpicOptionLabel(epic)}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="due_date"
              control={form.control}
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <Label
                    htmlFor="task-due"
                    className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-600"
                  >
                    Due date
                  </Label>
                  <FormControl>
                    <Input
                      id="task-due"
                      type="datetime-local"
                      className={cn(
                        "h-11 rounded-lg [&::-webkit-calendar-picker-indicator]:cursor-pointer",
                        inputSurfaceClass,
                      )}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
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
                      htmlFor="task-description"
                      className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-600"
                    >
                      Description
                    </Label>
                    <span className="text-xs font-normal text-slate-400">Optional</span>
                  </div>
                  <div className="relative">
                    <FormControl>
                      <textarea
                        id="task-description"
                        {...field}
                        maxLength={2000}
                        rows={4}
                        placeholder="Provide detailed context for this task..."
                        className={cn(
                          "min-h-[112px] w-full resize-none pb-8 sm:min-h-[120px]",
                          inputSurfaceClass,
                        )}
                      />
                    </FormControl>
                    <p className="pointer-events-none absolute bottom-2 right-2.5 text-[11px] text-slate-400">
                      {descriptionLen} / 2000 characters
                    </p>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                {isPending ? "Creating..." : "Create Task"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
