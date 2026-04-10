"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProject } from "@/lib/actions/products/add-project";
import type { CreateProjectValues } from "@/lib/schemes/products-shema/add-project.shema";
import { queryKeys } from "@/lib/state/query-keys";
import { CreateProjectResponse } from "@/lib/types/project";



export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CreateProjectValues) => {
      const result = await createProject(values);

      if ("error" in result && result.error) {
        throw new Error(result.error);
      }

      return result.data as CreateProjectResponse[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}
