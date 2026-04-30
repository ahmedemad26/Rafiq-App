"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { getProjectTasksByStatus } from "@/lib/actions/products/tasks/get-project-tasks-by-status";
import type { TaskStatus } from "@/lib/constants/task-status";
import { queryKeys } from "@/lib/state/query-keys";

export function useProjectTasksByStatus(
  projectId: string,
  status: TaskStatus,
  pageSize = 10,
  searchTerm?: string,
) {
  const normalizedPageSize = Math.max(1, pageSize);
  const normalizedSearchTerm = searchTerm?.trim() ?? "";

  return useInfiniteQuery({
    queryKey: [...queryKeys.projects.root, "tasks", "board", projectId, status, normalizedSearchTerm] as const,
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const result = await getProjectTasksByStatus(projectId, status, {
        page: pageParam,
        pageSize: normalizedPageSize,
        searchTerm: normalizedSearchTerm,
      });
      if ("error" in result && result.error) {
        throw new Error(result.error);
      }
      return "data" in result ? { data: result.data, total: result.total, page: pageParam } : { data: [], total: 0, page: pageParam };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce((acc, page) => acc + page.data.length, 0);
      if (loadedCount >= lastPage.total) return undefined;
      return allPages.length + 1;
    },
    enabled: Boolean(projectId),
  });
}

