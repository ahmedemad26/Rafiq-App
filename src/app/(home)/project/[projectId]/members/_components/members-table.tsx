"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/utils";
import { type ProjectMember } from "@/lib/types/member";
import { MoreVertical } from "lucide-react";

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

function formatJoinedAt() {
  return "Oct 12, 2023";
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

export function MembersTable({ members }: { members: ProjectMember[] }) {
  if (members.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/70 bg-white px-5 py-8 text-center text-sm text-slate-500 shadow-[0_4px_24px_rgba(15,23,42,0.06)] sm:px-6">
        No members found for this project.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.06)]">
      <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.4fr] gap-4 border-b border-slate-200 bg-slate-50/50 px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 sm:px-6">
        <span>Member</span>
        <span>Role</span>
        <span>Joined at</span>
        <span className="text-right">Actions</span>
      </div>
      <ul>
        {members.map((member) => (
          (() => {
            const displayName = displayNameFromMember(member);
            return (
          <li
            key={member.id}
            className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.4fr] items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-b-0 sm:px-6"
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
            <span
              className={cn(
                "inline-flex w-fit items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.05em]",
                roleClassName(member.role),
              )}
            >
              {member.role}
            </span>
            <p className="text-sm text-slate-500">{formatJoinedAt()}</p>
            <div className="flex justify-end">
              {member.role === "Owner" ? null : (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  aria-label={`Open actions for ${displayName}`}
                >
                  <MoreVertical className="size-4" />
                </Button>
              )}
            </div>
          </li>
            );
          })()
        ))}
      </ul>
    </div>
  );
}
