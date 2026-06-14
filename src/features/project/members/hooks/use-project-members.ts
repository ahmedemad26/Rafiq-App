"use client";

import { useQuery } from "@tanstack/react-query";
import { getProjectMembers } from "@/lib/actions/products/members/get-project-members";
import { queryKeys } from "@/lib/state/query-keys";
import type { ProjectMember } from "@/lib/types/member";

export function useProjectMembers(projectId: string) {
  const query = useQuery({
    queryKey: [...queryKeys.projects.root, "members", projectId] as const,
    queryFn: async () => {
      const result = await getProjectMembers(projectId);
      if ("error" in result && result.error) {
        throw new Error(result.error);
      }
      return result.data as ProjectMember[];
    },
    enabled: Boolean(projectId),
  });

  return query;
}
