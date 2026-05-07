"use client";

import { useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { toast } from "sonner";
import { acceptInvitation } from "@/lib/actions/products/members/accept-invitation";
import { InvitePageContent, InviteStateCard } from "./invite-page-content";

export default function InvitePageClient() {
  const { status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = useMemo(() => searchParams.get("token")?.trim() ?? "", [searchParams]);

  const acceptMutation = useMutation({
    mutationFn: async (invitationToken: string) => {
      const result = await acceptInvitation(invitationToken);
      if ("error" in result && result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: (result) => {
      if (!("success" in result)) return;
      toast.success("Invitation accepted successfully");
      if (result.projectId) {
        router.replace(`/project/${result.projectId}`);
      } else {
        router.replace("/project");
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to accept invitation");
    },
  });

  if (!token) {
    return <InviteStateCard title="Invalid invitation link" message="Invitation token is missing." />;
  }
  if (status === "loading") {
    return <InviteStateCard title="Loading" message="Checking your session..." />;
  }
  if (status === "unauthenticated") {
    const callback = encodeURIComponent(`/invite?token=${token}`);
    router.replace(`/login?callbackUrl=${callback}`);
    return null;
  }

  return (
    <InvitePageContent
      isPending={acceptMutation.isPending}
      onCancel={() => router.replace("/project")}
      onAccept={() => acceptMutation.mutate(token)}
    />
  );
}
