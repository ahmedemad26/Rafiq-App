"use client";

import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import {
  getProjectsPage,
} from "@/lib/actions/products/get-projects";
import type { GetProjectsPageSuccess } from "@/lib/types/project";

export const PROJECTS_PAGE_SIZE = 10;

export function useProjectsPageQuery(opts: {
  page: number;
  limit?: number;
  enabled?: boolean;
}) {
  const limit = opts.limit ?? PROJECTS_PAGE_SIZE;
  const offset = (opts.page - 1) * limit;

  return useQuery({
    queryKey: ["projects", "page", opts.page, limit] as const,
    queryFn: async () => {
      const result = await getProjectsPage({ limit, offset });
      if ("error" in result && result.error) {
        throw new Error(result.error);
      }
      return result as GetProjectsPageSuccess;
    },
    enabled: opts.enabled !== false,
    placeholderData: keepPreviousData,
  });
}

export function useProjectsInfiniteQuery(opts: {
  limit?: number;
  enabled?: boolean;
}) {
  const limit = opts.limit ?? PROJECTS_PAGE_SIZE;

  return useInfiniteQuery({
    queryKey: ["projects", "infinite", limit] as const,
    initialPageParam: 0,
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const offset = pageParam * limit;
      const result = await getProjectsPage({ limit, offset });
      if ("error" in result && result.error) {
        throw new Error(result.error);
      }
      return result as GetProjectsPageSuccess;
    },
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, p) => sum + p.data.length, 0);
      if (loaded >= lastPage.totalCount) return undefined;
      return allPages.length;
    },
    enabled: opts.enabled !== false,
  });
}
