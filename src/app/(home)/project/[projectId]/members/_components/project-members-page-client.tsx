"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import MembersBreadcrumb from "./members-breadcrumb";
import { useProjectMembers } from "../_hooks/use-project-members";
import { useProjectInvitations } from "../_hooks/use-project-invitations";
import { MembersErrorState, MembersLoadingState } from "@/components/skeleton/member-skelton";
import { UserPlus } from "lucide-react";
import { MemberRoleLabel, MembersTable } from "./members-table";
import InviteMemberDialog from "./invite-member-dialog";
import { PendingInvitationsTable } from "./pending-invitations-table";
import { updateMemberRole } from "@/lib/actions/products/members/update-member-role";
import type { ProjectMember } from "@/lib/types/member";
import { queryKeys } from "@/lib/state/query-keys";

type ProjectMembersPageClientProps = {
  projectId: string;
};

export default function ProjectMembersPageClient({ projectId }: ProjectMembersPageClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isPending, isError, error, refetch } = useProjectMembers(projectId);
  const {
    data: invitations,
    isPending: isInvitationsPending,
    isError: isInvitationsError,
    error: invitationsError,
  } = useProjectInvitations(projectId);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const rawErrorMessage = useMemo(() => (error instanceof Error ? error.message : ""), [error]);
  const pendingInvitations = useMemo(() => {
    const membersEmailSet = new Set(
      (data ?? [])
        .map((member) => member.email?.trim().toLowerCase())
        .filter((email): email is string => Boolean(email)),
    );

    return (invitations ?? []).filter((invitation) => {
      const invitationEmail = invitation.email?.trim().toLowerCase();
      if (!invitationEmail) return false;
      return !membersEmailSet.has(invitationEmail);
    });
  }, [data, invitations]);

  const updateRoleMutation = useMutation({
    mutationFn: async (payload: { member: ProjectMember; role: MemberRoleLabel }) => {
      const userId = payload.member.userId?.trim();
      if (!userId) {
        throw new Error("This member cannot be updated because user id is missing.");
      }

      const result = await updateMemberRole({
        projectId,
        userId,
        role: payload.role.toLowerCase(),
      });

      if ("error" in result && result.error) {
        throw new Error(result.error);
      }

      return payload;
    },
    onMutate: ({ member }) => {
      setUpdatingUserId(member.userId ?? member.id);
    },
    onSuccess: async ({ role }) => {
      toast.success(`Member role updated to ${role}.`);
      await queryClient.invalidateQueries({
        queryKey: [...queryKeys.projects.root, "members", projectId],
      });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update member role.");
    },
    onSettled: () => {
      setUpdatingUserId(null);
    },
  });

  const handleRoleChange = (member: ProjectMember, role: MemberRoleLabel) => {
    if (!member.userId) {
      toast.error("Cannot update role for this member.");
      return;
    }
    if (member.role === role) return;
    updateRoleMutation.mutate({ member, role });
  };

  useEffect(() => {
    if (!isError) return;
    const normalized = rawErrorMessage.toLowerCase();
    if (!normalized.includes("jwt expired") && !normalized.includes("unauthorized")) return;
    const callback = encodeURIComponent(`/project/${projectId}/members`);
    router.replace(`/login?callbackUrl=${callback}`);
  }, [rawErrorMessage, isError, projectId, router]);

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
          Invite Members
        </Button>
      </div>

      <InviteMemberDialog
        projectId={projectId}
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />

      {isPending ? <MembersLoadingState /> : null}
      {!isPending && isError ? (
        <MembersErrorState message="Failed to load project members. Please try again." onRetry={() => void refetch()} />
      ) : null}
      {!isPending && !isError ? (
        <MembersTable
          members={data ?? []}
          onRoleChange={handleRoleChange}
          updatingUserId={updatingUserId}
        />
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
