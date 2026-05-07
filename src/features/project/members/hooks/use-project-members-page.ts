"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateMemberRole } from "@/lib/actions/products/members/update-member-role";
import { queryKeys } from "@/lib/state/query-keys";
import type { ProjectMember } from "@/lib/types/member";
import { useProjectInvitations } from "./use-project-invitations";
import { useProjectMembers } from "./use-project-members";

export type MemberRoleLabel = ProjectMember["role"];

export function useProjectMembersPage(projectId: string) {
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
    onError: (mutationError) => {
      toast.error(mutationError instanceof Error ? mutationError.message : "Failed to update member role.");
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

  return {
    members: data ?? [],
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
  };
}
