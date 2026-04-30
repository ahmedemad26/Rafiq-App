"use client";

import type { ProjectInvitation } from "@/lib/types/member";

function formatDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export function PendingInvitationsTable({ invitations }: { invitations: ProjectInvitation[] }) {
  if (invitations.length === 0) return null;

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.06)]">
      <div className="border-b border-slate-200 bg-slate-50/50 px-5 py-4 sm:px-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">Pending Invitations</h2>
      </div>
      <div className="grid grid-cols-[1.2fr_0.7fr_0.7fr] gap-4 border-b border-slate-200 bg-slate-50/50 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 sm:px-6">
        <span>Email</span>
        <span>Invited at</span>
        <span>Expires at</span>
      </div>
      <ul>
        {invitations.map((invitation) => (
          <li
            key={invitation.id}
            className="grid grid-cols-[1.2fr_0.7fr_0.7fr] items-center gap-4 border-b border-slate-100 px-5 py-4 text-sm last:border-b-0 sm:px-6"
          >
            <p className="truncate font-medium text-[#11284d]">{invitation.email || "-"}</p>
            <p className="text-slate-500">{formatDate(invitation.createdAt)}</p>
            <p className="text-slate-500">{formatDate(invitation.expiresAt)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
