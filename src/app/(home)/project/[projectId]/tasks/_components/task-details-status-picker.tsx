"use client";

import { ChevronDown } from "lucide-react";
import type { TaskStatus } from "@/lib/constants/task-status";
import { TASK_STATUSES, taskStatusLabel } from "@/lib/constants/task-status";
import { cn } from "@/lib/utils/utils";
import { statusBadgeClass } from "./task-details-utils";

export function TaskDetailsStatusPicker({
  status,
  open,
  setOpen,
  isPending,
  onChange,
}: {
  status: TaskStatus | null;
  open: boolean;
  setOpen: (open: boolean) => void;
  isPending: boolean;
  onChange: (next: TaskStatus) => void;
}) {
  return (
    <div className="relative">
      <p className="text-[10px] font-bold tracking-[0.08em] text-slate-400 uppercase">Status</p>
      <button
        type="button"
        disabled={isPending}
        onClick={() => setOpen(!open)}
        className={cn(
          "mt-2 inline-flex w-full items-center justify-between rounded-sm px-3 py-2 text-[10px] font-bold tracking-[0.08em] uppercase",
          statusBadgeClass(status),
          isPending && "cursor-not-allowed opacity-60",
        )}
      >
        <span>{status ? taskStatusLabel(status) : "Unknown"}</span>
        <ChevronDown className="size-3.5" />
      </button>
      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
          {TASK_STATUSES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onChange(item)}
              className={cn(
                "flex w-full items-center justify-between px-3 py-2 text-left text-xs font-semibold uppercase hover:bg-slate-50",
                status === item ? "bg-slate-50 text-[#003380]" : "text-slate-700",
              )}
            >
              {taskStatusLabel(item)}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
