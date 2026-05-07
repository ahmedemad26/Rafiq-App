"use client";

import { CheckCircle2, MailOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { InvitePageContentProps, InviteStateCardProps } from "@/lib/types/invite-page";

export function InvitePageContent({ isPending, onCancel, onAccept }: InvitePageContentProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-[#F7F9FF] via-[#F4F7FA] to-[#EEF3FF] px-4 py-8">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200/80 bg-white p-7 shadow-[0_20px_60px_rgba(15,23,42,0.1)] sm:p-8">
        <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8EEF8] text-[#003380]">
          <MailOpen className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#11284d]">Accept Project Invitation</h1>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          You were invited to join a project workspace. Click below to accept your invitation.
        </p>
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            size="default"
            variant="ghost"
            className="h-11 rounded-md border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="default"
            variant="brand"
            className="h-11 gap-2 rounded-md bg-[#003380]! px-6 text-sm font-semibold text-white shadow-sm hover:bg-[#002d6e]! hover:opacity-100!"
            onClick={onAccept}
            disabled={isPending}
          >
            {!isPending ? <CheckCircle2 className="h-4 w-4" /> : null}
            {isPending ? "Accepting..." : "Accept Invitation"}
          </Button>
        </div>
      </div>
    </main>
  );
}

export function InviteStateCard({ title, message }: InviteStateCardProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-[#F7F9FF] via-[#F4F7FA] to-[#EEF3FF] px-4 py-8">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200/80 bg-white p-7 text-center shadow-[0_20px_60px_rgba(15,23,42,0.1)] sm:p-8">
        <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8EEF8] text-[#003380]">
          <MailOpen className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#11284d]">{title}</h1>
        <p className="mt-3 text-base text-slate-600">{message}</p>
      </div>
    </main>
  );
}
