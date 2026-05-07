"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getProjectEpics,
} from "@/lib/actions/products/epics/get-project-epics";
import type { GetProjectEpicsSuccess } from "@/lib/types/epics";
import { queryKeys } from "@/lib/state/query-keys";

const EPIC_SELECT_LIMIT = 100;

export function useProjectEpicsForSelect(projectId: string) {
  return useQuery({
    queryKey: [...queryKeys.projects.root, "epics", "select", projectId] as const,
    queryFn: async () => {
      const result = await getProjectEpics({
        projectId,
        limit: EPIC_SELECT_LIMIT,
        offset: 0,
      });
      if ("error" in result && result.error) {
        throw new Error(result.error);
      }
      return result as GetProjectEpicsSuccess;
    },
    enabled: Boolean(projectId),
  });
}

