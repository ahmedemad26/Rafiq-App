"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import MembersBreadcrumb from "./members-breadcrumb";
import { useProjectMembers } from "../_hooks/use-project-members";
import { MembersErrorState, MembersLoadingState } from "@/components/skeleton/member-skelton";
import { UserPlus } from "lucide-react";
import { MembersTable } from "./members-table";
import InviteMemberDialog from "./invite-member-dialog";

type ProjectMembersPageClientProps = {
  projectId: string;
};

export default function ProjectMembersPageClient({ projectId }: ProjectMembersPageClientProps) {
  const router = useRouter();
  const { data, isPending, isError, error, refetch } = useProjectMembers(projectId);
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
    </section>
  );
}
