"use client";

import { ChevronDown } from "lucide-react";
import type { TaskStatus } from "@/lib/constants/task-status";
import { TASK_STATUSES, taskStatusLabel } from "@/lib/constants/task-status";
import { cn } from "@/lib/utils/utils";
import { DropdownOptionButton, DropdownPanel } from "@/components/ui/dropdown-primitives";
import { statusBadgeClass } from "../utils/task-details-utils";

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
        <DropdownPanel className="top-[calc(100%+4px)]">
          {TASK_STATUSES.map((item) => (
            <DropdownOptionButton
              key={item}
              onClick={() => onChange(item)}
              className={cn(
                "flex items-center justify-between text-xs font-semibold uppercase",
              )}
              active={status === item}
            >
              {taskStatusLabel(item)}
            </DropdownOptionButton>
          ))}
        </DropdownPanel>
      ) : null}
    </div>
  );
}

