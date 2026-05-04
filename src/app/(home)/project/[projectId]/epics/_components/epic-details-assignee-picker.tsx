"use client";

import { useEffect, useRef } from "react";
import type { ProjectEpic } from "@/lib/types/epics";
import type { ProjectMember } from "@/lib/types/member";
import { cn } from "@/lib/utils/utils";
import { initialsFromName } from "./epic-details-utils";

export function EpicDetailsAssigneePicker(props: {
  epic: ProjectEpic;
  isPending: boolean;
  isMembersLoading: boolean;
  members: ProjectMember[];
  open: boolean;
  setOpen: (open: boolean) => void;
  assigneeAvatarUrl: string | null;
  assigneeName: string;
  onPick: (userId: string | null) => void;
}) {
  const {
    epic,
    isPending,
    isMembersLoading,
    members,
    open,
    setOpen,
    assigneeAvatarUrl,
    assigneeName,
    onPick,
  } = props;

  const popoverRef = useRef<HTMLDivElement>(null);

  const memberAssigneeValue = (member: ProjectMember): string =>
    member.userId?.trim() || "";

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const el = popoverRef.current;
      if (el && !el.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, setOpen]);

  const currentAssigneeSub = epic?.assignee?.sub?.trim() ?? "";
  const assignableMembers = members.filter((m) => Boolean(m.userId?.trim()));

  const handlePick = (userId: string | null) => {
    const nextSub = userId?.trim() ?? "";
    if (nextSub === currentAssigneeSub) {
      setOpen(false);
      return;
    }
    setOpen(false);
    onPick(userId);
  };

  return (
    <div className="relative" ref={popoverRef}>
      {!open ? (
        <button
          type="button"
          disabled={isPending}
          onClick={() => setOpen(true)}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg border border-transparent bg-[#EEF2FF] px-3.5 py-2.5 text-left transition-colors",
            "hover:bg-[#E6ECFC] focus-visible:ring-2 focus-visible:ring-[#003380]/20 focus-visible:outline-none",
            isPending && "pointer-events-none opacity-60",
          )}
        >
          <span
            className={cn(
              "inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-bold text-white",
              assigneeAvatarUrl ? "bg-slate-200" : "bg-emerald-500",
            )}
          >
            {assigneeAvatarUrl ? (
              <span
                className="size-full bg-cover bg-center"
                style={{ backgroundImage: `url(${assigneeAvatarUrl})` }}
                aria-hidden
              />
            ) : (
              initialsFromName(assigneeName)
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-[#11284d]">
              {assigneeName}
            </span>
            <span className="text-xs text-slate-500">Click to change</span>
          </span>
        </button>
      ) : (
        <div className="absolute left-0 right-0 top-0 z-10 max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-slate-900/5">
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50"
            onClick={() => handlePick(null)}
          >
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
              —
            </span>
            <span className="font-medium text-[#11284d]">Unassigned</span>
          </button>
          {isMembersLoading ? (
            <p className="px-3 py-2 text-xs text-slate-500">Loading members…</p>
          ) : null}
          {assignableMembers.map((member) => {
            const display = member.name?.trim() || member.email || "Member";
            return (
              <button
                key={member.id}
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50"
                onClick={() => handlePick(memberAssigneeValue(member))}
              >
                {member.avatarUrl ? (
                  <span
                    className="size-8 shrink-0 rounded-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${member.avatarUrl})` }}
                    aria-hidden
                  />
                ) : (
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-[#E8EEF8] text-xs font-semibold text-[#003380]">
                    {initialsFromName(display)}
                  </span>
                )}
                <span className="min-w-0 flex-1 truncate font-medium text-[#11284d]">
                  {display}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

