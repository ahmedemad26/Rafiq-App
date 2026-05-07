"use client";

import { useQuery } from "@tanstack/react-query";
import { getProjectTaskDetails } from "@/lib/actions/products/tasks/get-project-task-details";
import type { ProjectTask } from "@/lib/types/project-tasks";
import { queryKeys } from "@/lib/state/query-keys";

export function useProjectTaskDetails(opts: {
  projectId: string;
  taskId: string | null;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: [...queryKeys.projects.root, "tasks", "details", opts.projectId, opts.taskId] as const,
    queryFn: async () => {
      const result = await getProjectTaskDetails(opts.projectId, opts.taskId ?? "");
      if ("error" in result && result.error) {
        throw new Error(result.error);
      }
      return "data" in result ? (result.data as ProjectTask | null) : null;
    },
    enabled: Boolean(opts.projectId) && Boolean(opts.taskId) && opts.enabled !== false,
  });
}


