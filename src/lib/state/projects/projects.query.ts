"use client";

import { useQuery } from "@tanstack/react-query";
import { getProjects } from "@/lib/actions/products/get-projects";
import { queryKeys } from "@/lib/state/query-keys";
import { Project } from "@/lib/types/project";



export function useGetProjects() {
  return useQuery({
    queryKey: queryKeys.projects.all,
    queryFn: async () => {
      const result = await getProjects();

      if ("error" in result && result.error) {
        throw new Error(result.error);
      }

      return (result.data ?? []) as Project[];
    },
  });
}
