"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateProject } from "@/lib/actions/products/update-project";
import { queryKeys } from "@/lib/state/query-keys";
import type { UpdateProjectPayload } from "../types/update-project-payload";

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, values }: UpdateProjectPayload) => {
      const result = await updateProject({ projectId, values });
      if ("error" in result && result.error) {
        throw new Error(result.error);
      }

      return result.data;
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.root });
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.projects.root, "details", projectId],
      });
      toast.success("Project updated successfully");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update project");
    },
  });
}
