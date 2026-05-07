"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils/utils";
import type { ProjectMember } from "@/lib/types/member";
import { DropdownOptionButton, DropdownPanel } from "@/components/ui/dropdown-primitives";
import { memberAssigneeValue, memberOptionLabel } from "../utils/task-details-utils";

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
        <DropdownPanel className="max-h-56 overflow-y-auto py-1">
          <DropdownOptionButton onClick={() => onChange(null)} className="font-medium">
            Unassigned
          </DropdownOptionButton>
          {isMembersPending ? (
            <p className="px-3 py-2 text-xs text-slate-500">Loading members…</p>
          ) : null}
          {assignableMembers.map((member) => {
            const memberValue = memberAssigneeValue(member);
            const isActive = memberValue === effectiveAssigneeId || memberValue === currentAssigneeValue;
            return (
              <DropdownOptionButton
                key={member.id}
                onClick={() => onChange(memberValue)}
                active={isActive}
              >
                {memberOptionLabel(member)}
              </DropdownOptionButton>
            );
          })}
        </DropdownPanel>
      ) : null}
    </div>
  );
}

