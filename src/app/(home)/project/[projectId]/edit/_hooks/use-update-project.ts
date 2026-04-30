"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProject } from "@/lib/actions/products/update-project";
import type { UpdateProjectValues } from "@/lib/schemes/products-shema/update-project.shema";
import { queryKeys } from "@/lib/state/query-keys";
import { toast } from "sonner";

type UpdateProjectPayload = {
  projectId: string;
  values: UpdateProjectValues;
};

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, values }: UpdateProjectPayload) => {
      const result = await updateProject({ projectId, values });
      if ("error" in result && result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.root });
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.projects.root, "details", projectId],
      });
      toast.success("Project updated successfully");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update project");
    },
  });
}
