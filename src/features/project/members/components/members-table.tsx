"use client";

import { ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import type { ProjectMember } from "@/lib/types/member";

export type MemberRoleLabel = ProjectMember["role"];

function initialsFromName(name: string | null | undefined) {
  const normalizedName = typeof name === "string" ? name.trim() : "";
  const parts = normalizedName.split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "U";
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function roleClassName(role: ProjectMember["role"]) {
  switch (role) {
    case "Owner":
      return "bg-[#0A4DB31A] text-[#0A4DB3]";
    case "Admin":
      return "bg-[#0A4DB31A] text-[#0A4DB3]";
    case "Viewer":
      return "bg-[#64748B1A] text-slate-500";
    default:
      return "bg-[#0A4DB31A] text-[#0A4DB3]";
  }
}

function displayNameFromMember(member: ProjectMember) {
  const directName = member.name?.trim();
  if (directName) return directName;
  const email = member.email?.trim() ?? "";
  if (email.includes("@")) {
    const localPart = email.split("@")[0]?.trim();
    if (localPart) return localPart;
  }
  return "Unknown User";
}

export function MembersTable({
  members,
  onRoleChange,
  updatingUserId,
}: {
  members: ProjectMember[];
  onRoleChange: (member: ProjectMember, role: MemberRoleLabel) => void;
  updatingUserId?: string | null;
}) {
  if (members.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/70 bg-white px-5 py-8 text-center text-sm text-slate-500 shadow-[0_4px_24px_rgba(15,23,42,0.06)] sm:px-6">
        No members found for this project.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.06)]">
      <div className="grid grid-cols-[1.4fr_0.5fr_0.4fr] gap-4 border-b border-slate-200 bg-slate-50/50 px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 sm:px-6">
        <span>Member</span>
        <span>Role</span>
        <span className="text-right">Actions</span>
      </div>
      <ul>
        {members.map((member) => {
          const displayName = displayNameFromMember(member);
          const memberKey = member.userId ?? member.id;
          return (
            <li
              key={member.id}
              className="grid grid-cols-[1.4fr_0.5fr_0.4fr] items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-b-0 sm:px-6"
            >
              <div className="flex min-w-0 items-center gap-3">
                {member.avatarUrl ? (
                  <div
                    role="img"
                    aria-label={`${displayName} avatar`}
                    className="size-8 rounded-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${member.avatarUrl})` }}
                  />
                ) : (
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#E8EEF8] text-xs font-semibold text-[#003380]">
                    {initialsFromName(displayName)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#11284d]">{displayName}</p>
                  <p className="truncate text-xs text-slate-500">{member.email}</p>
                </div>
              </div>
              <div className="flex justify-start">
                <span
                  className={cn(
                    "inline-flex w-fit items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.05em]",
                    roleClassName(member.role),
                  )}
                >
                  {member.role}
                </span>
              </div>
              <div className="flex justify-end">
                {member.role === "Owner" ? (
                  <span className="text-xs font-semibold text-slate-400">—</span>
                ) : (
                  <div className="relative inline-flex items-center">
                    <label className="sr-only" htmlFor={`member-role-${member.id}`}>
                      Change role for {displayName}
                    </label>
                    <select
                      id={`member-role-${member.id}`}
                      value={member.role}
                      onChange={(event) => onRoleChange(member, event.target.value as MemberRoleLabel)}
                      disabled={updatingUserId === memberKey}
                      className="h-8 min-w-25 appearance-none rounded-md border border-slate-200 bg-white px-2.5 pr-7 text-[11px] font-semibold text-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-[#003380]/20 disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label={`Change role for ${displayName}`}
                    >
                      <option value="Admin">Admin</option>
                      <option value="Member">Member</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                    {updatingUserId === memberKey ? (
                      <Loader2 className="pointer-events-none absolute right-2 size-3.5 animate-spin text-slate-500" />
                    ) : (
                      <ChevronDown className="pointer-events-none absolute right-2 size-3.5 text-slate-500" />
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
