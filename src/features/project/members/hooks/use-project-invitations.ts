"use client";

import { useQuery } from "@tanstack/react-query";
import { getProjectInvitations } from "@/lib/actions/products/members/get-project-invitations";
import { queryKeys } from "@/lib/state/query-keys";
import type { ProjectInvitation } from "@/lib/types/member";

export function useProjectInvitations(projectId: string) {
  return useQuery({
    queryKey: [...queryKeys.projects.root, "invitations", projectId] as const,
    queryFn: async () => {
      const result = await getProjectInvitations(projectId);
      if ("error" in result && result.error) {
        throw new Error(result.error);
      }
      return result.data as ProjectInvitation[];
    },
    enabled: Boolean(projectId),
  });
}
