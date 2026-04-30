"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import MembersBreadcrumb from "./members-breadcrumb";
import { useProjectMembers } from "../_hooks/use-project-members";
import { useProjectInvitations } from "../_hooks/use-project-invitations";
import { MembersErrorState, MembersLoadingState } from "@/components/skeleton/member-skelton";
import { UserPlus } from "lucide-react";
import { MembersTable } from "./members-table";
import InviteMemberDialog from "./invite-member-dialog";
import { PendingInvitationsTable } from "./pending-invitations-table";

type ProjectMembersPageClientProps = {
  projectId: string;
};

export default function ProjectMembersPageClient({ projectId }: ProjectMembersPageClientProps) {
  const router = useRouter();
  const { data, isPending, isError, error, refetch } = useProjectMembers(projectId);
  const {
    data: invitations,
    isPending: isInvitationsPending,
    isError: isInvitationsError,
    error: invitationsError,
  } = useProjectInvitations(projectId);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const errorMessage = useMemo(
    () => (error instanceof Error ? error.message : "Failed to load project members. Please try again."),
    [error],
  );

  useEffect(() => {
    if (!isError) return;
    const normalized = errorMessage.toLowerCase();
    if (!normalized.includes("jwt expired") && !normalized.includes("unauthorized")) return;
    const callback = encodeURIComponent(`/project/${projectId}/members`);
    router.replace(`/login?callbackUrl=${callback}`);
  }, [errorMessage, isError, projectId, router]);

  return (
    <section className="-mx-6 -mt-6 flex min-h-[calc(100svh-8rem)] flex-col overflow-x-hidden bg-[#F4F7FA] px-6 pb-16 pt-0">
      <div className="mt-2 w-full text-left sm:mt-3">
        <MembersBreadcrumb projectLabel={projectId} />
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold leading-none tracking-tight text-[#11284d]">
          Project Members
        </h1>
        <Button
          type="button"
          variant="brand"
          size="default"
          className="h-10 rounded-md bg-[#003380]! px-4 text-sm font-semibold text-white hover:bg-[#002d6e]! hover:opacity-100!"
          onClick={() => setInviteDialogOpen(true)}
        >
          <UserPlus className="mr-2 size-4" />
          Invite Member
        </Button>
      </div>

      <InviteMemberDialog
        projectId={projectId}
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />

      {isPending ? <MembersLoadingState /> : null}
      {!isPending && isError ? (
        <MembersErrorState message={errorMessage} onRetry={() => void refetch()} />
      ) : null}
      {!isPending && !isError ? <MembersTable members={data ?? []} /> : null}
      {!isPending && !isError && !isInvitationsPending ? (
        <PendingInvitationsTable invitations={invitations ?? []} />
      ) : null}
      {!isPending && !isError && !isInvitationsPending && !isInvitationsError && (invitations ?? []).length === 0 ? (
        <div className="mt-6 rounded-2xl border border-slate-200/70 bg-white px-5 py-4 text-sm text-slate-500 shadow-[0_4px_24px_rgba(15,23,42,0.06)] sm:px-6">
          No pending invitations for this project.
        </div>
      ) : null}
      {!isPending && !isError && isInvitationsError ? (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 sm:px-6">
          Failed to load pending invitations:{" "}
          {invitationsError instanceof Error ? invitationsError.message : "Unknown error"}
        </div>
      ) : null}
    </section>
  );
}
