"use client";

import { useQuery } from "@tanstack/react-query";
import { getProjectTasks } from "@/lib/actions/products/tasks/get-project-tasks";
import { queryKeys } from "@/lib/state/query-keys";

export function useProjectTasks(
  projectId: string,
  opts?: { page?: number; pageSize?: number; searchTerm?: string },
) {
  const page = Math.max(1, opts?.page ?? 1);
  const pageSize = Math.max(1, opts?.pageSize ?? 10);
  const searchTerm = opts?.searchTerm?.trim() ?? "";

  return useQuery({
    queryKey: [...queryKeys.projects.root, "tasks", "list", projectId, page, pageSize, searchTerm] as const,
    queryFn: async () => {
      const result = await getProjectTasks(projectId, { page, pageSize, searchTerm });
      if ("error" in result && result.error) {
        throw new Error(result.error);
      }
      return "data" in result ? { data: result.data, total: result.total } : { data: [], total: 0 };
    },
    enabled: Boolean(projectId),
  });
}


