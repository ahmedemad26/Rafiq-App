"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProject } from "@/lib/actions/products/add-project";
import type { CreateProjectValues } from "@/lib/schemes/products-shema/add-project.shema";
import { queryKeys } from "@/lib/state/query-keys";
import { toast } from "sonner";

export function useAddNewProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CreateProjectValues) => {
      const result = await createProject(values);
      if ("error" in result && result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.root });
      toast.success("Project created successfully");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to create project");
    },
  });
}
