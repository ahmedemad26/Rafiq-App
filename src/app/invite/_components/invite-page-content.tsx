"use client";

import { Button } from "@/components/ui/button";
import type {
  InvitePageContentProps,
  InviteStateCardProps,
} from "../../../lib/types/invite-page";

export function InvitePageContent({
  isPending,
  onCancel,
  onAccept,
}: InvitePageContentProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4F7FA] px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-[#11284d]">Accept Project Invitation</h1>
        <p className="mt-2 text-sm text-slate-600">
          You were invited to join a project workspace. Click below to accept your invitation.
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            className="h-10 px-4"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="brand"
            className="h-10 rounded-md bg-[#003380]! px-4 text-sm font-semibold text-white hover:bg-[#002d6e]! hover:opacity-100!"
            onClick={onAccept}
            disabled={isPending}
          >
            {isPending ? "Accepting..." : "Accept Invitation"}
          </Button>
        </div>
      </div>
    </main>
  );
}

export function InviteStateCard({
  title,
  message,
}: InviteStateCardProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4F7FA] px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center">
        <h1 className="text-xl font-bold text-[#11284d]">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">{message}</p>
      </div>
    </main>
  );
}
