"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils/utils";
import type { ProjectMember } from "@/lib/types/member";
import { memberAssigneeValue, memberOptionLabel } from "./task-details-utils";

export function TaskDetailsAssigneePicker({
  open,
  setOpen,
  isPending,
  isMembersPending,
  assignableMembers,
  effectiveAssigneeId,
  currentAssigneeValue,
  triggerContent,
  onChange,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  isPending: boolean;
  isMembersPending: boolean;
  assignableMembers: ProjectMember[];
  effectiveAssigneeId: string;
  currentAssigneeValue: string;
  triggerContent: ReactNode;
  onChange: (assigneeId: string | null) => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        disabled={isPending}
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full rounded-md p-0 text-left",
          isPending && "cursor-not-allowed opacity-60",
        )}
      >
        {triggerContent}
      </button>
      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-56 overflow-y-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg">
          <button
            type="button"
            onClick={() => onChange(null)}
            className="w-full px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Unassigned
          </button>
          {isMembersPending ? (
            <p className="px-3 py-2 text-xs text-slate-500">Loading members…</p>
          ) : null}
          {assignableMembers.map((member) => {
            const memberValue = memberAssigneeValue(member);
            const isActive = memberValue === effectiveAssigneeId || memberValue === currentAssigneeValue;
            return (
              <button
                key={member.id}
                type="button"
                onClick={() => onChange(memberValue)}
                className={cn(
                  "w-full px-3 py-2 text-left text-sm hover:bg-slate-50",
                  isActive ? "bg-slate-50 font-semibold text-[#003380]" : "text-slate-700",
                )}
              >
                {memberOptionLabel(member)}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
