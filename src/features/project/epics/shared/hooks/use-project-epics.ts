"use client";

import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getProjectEpics } from "@/lib/actions/products/epics/get-project-epics";
import { queryKeys } from "@/lib/state/query-keys";
import type { GetProjectEpicsSuccess } from "@/lib/types/epics";

export const PROJECT_EPICS_PAGE_SIZE = 10;

export function useProjectEpicsPageQuery(opts: {
  projectId: string;
  page: number;
  searchTerm?: string;
  limit?: number;
  enabled?: boolean;
}) {
  const limit = opts.limit ?? PROJECT_EPICS_PAGE_SIZE;
  const offset = (opts.page - 1) * limit;

  return useQuery({
    queryKey: [
      ...queryKeys.projects.root,
      "epics",
      "page",
      opts.projectId,
      opts.page,
      opts.searchTerm?.trim().toLowerCase() ?? "",
      limit,
    ] as const,
    queryFn: async () => {
      const result = await getProjectEpics({
        projectId: opts.projectId,
        limit,
        offset,
        searchTerm: opts.searchTerm,
      });
      if ("error" in result && result.error) {
        throw new Error(result.error);
      }
      return result as GetProjectEpicsSuccess;
    },
    enabled: Boolean(opts.projectId) && opts.enabled !== false,
    placeholderData: keepPreviousData,
  });
}

export function useProjectEpicsInfiniteQuery(opts: {
  projectId: string;
  searchTerm?: string;
  limit?: number;
  enabled?: boolean;
}) {
  const limit = opts.limit ?? PROJECT_EPICS_PAGE_SIZE;

  return useInfiniteQuery({
    queryKey: [
      ...queryKeys.projects.root,
      "epics",
      "infinite",
      opts.projectId,
      opts.searchTerm?.trim().toLowerCase() ?? "",
      limit,
    ] as const,
    initialPageParam: 0,
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const offset = pageParam * limit;
      const result = await getProjectEpics({
        projectId: opts.projectId,
        limit,
        offset,
        searchTerm: opts.searchTerm,
      });
      if ("error" in result && result.error) {
        throw new Error(result.error);
      }
      return result as GetProjectEpicsSuccess;
    },
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, page) => sum + page.data.length, 0);
      if (loaded >= lastPage.totalCount) return undefined;
      return allPages.length;
    },
    enabled: Boolean(opts.projectId) && opts.enabled !== false,
  });
}
