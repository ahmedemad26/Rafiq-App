"use client";

import { useQuery } from "@tanstack/react-query";
import { getProjectById } from "@/lib/actions/products/get-project-by-id";
import { queryKeys } from "@/lib/state/query-keys";
import type { ProjectDetails } from "@/lib/types/project";

export function useProjectDetails(projectId: string) {
  return useQuery({
    queryKey: [...queryKeys.projects.root, "details", projectId] as const,
    queryFn: async () => {
      const result = await getProjectById(projectId);
      if ("error" in result && result.error) {
        throw new Error(result.error);
      }

      return result.data as ProjectDetails;
    },
    enabled: Boolean(projectId),
  });
}
