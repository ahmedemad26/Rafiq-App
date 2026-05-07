"use client";

import { UserPlus } from "lucide-react";
import { MembersErrorState, MembersLoadingState } from "@/components/loading";
import { Button } from "@/components/ui/button";
import type { ProjectMembersPageClientProps } from "@/lib/types/features/members/project-members-page-client";
import { useProjectMembersPage } from "../hooks/use-project-members-page";
import InviteMemberDialog from "./invite-member-dialog";
import MembersBreadcrumb from "./members-breadcrumb";
import { MembersTable } from "./members-table";
import { PendingInvitationsTable } from "./pending-invitations-table";

export default function ProjectMembersPageClient({ projectId }: ProjectMembersPageClientProps) {
  const {
    members,
    isPending,
    isError,
    refetch,
    inviteDialogOpen,
    setInviteDialogOpen,
    handleRoleChange,
    updatingUserId,
    pendingInvitations,
    isInvitationsPending,
    isInvitationsError,
    invitationsError,
  } = useProjectMembersPage(projectId);

  return (
    <section className="-mx-6 -mt-6 flex min-h-[calc(100svh-8rem)] flex-col overflow-x-hidden bg-[#F4F7FA] px-6 pb-16 pt-0">
      <div className="mt-2 w-full text-left sm:mt-3">
        <MembersBreadcrumb projectLabel={projectId} />
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold leading-none tracking-tight text-[#11284d]">Project Members</h1>
        <Button
          type="button"
          variant="brand"
          size="default"
          className="h-10 rounded-md bg-[#003380]! px-4 text-sm font-semibold text-white hover:bg-[#002d6e]! hover:opacity-100!"
          onClick={() => setInviteDialogOpen(true)}
        >
          <UserPlus className="mr-2 size-4" />
          Invite Members
        </Button>
      </div>

      <InviteMemberDialog projectId={projectId} open={inviteDialogOpen} onOpenChange={setInviteDialogOpen} />

      {isPending ? <MembersLoadingState /> : null}
      {!isPending && isError ? (
        <MembersErrorState message="Failed to load project members. Please try again." onRetry={() => void refetch()} />
      ) : null}
      {!isPending && !isError ? (
        <MembersTable members={members} onRoleChange={handleRoleChange} updatingUserId={updatingUserId} />
      ) : null}
      {!isPending && !isError && !isInvitationsPending ? (
        <PendingInvitationsTable invitations={pendingInvitations} />
      ) : null}
      {!isPending && !isError && !isInvitationsPending && !isInvitationsError && pendingInvitations.length === 0 ? (
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
