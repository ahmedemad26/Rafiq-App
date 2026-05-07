"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createTask } from "@/lib/actions/products/create-task";
import type { CreateTaskValues } from "@/lib/schemes/products-shema/create-task.schema";
import { queryKeys } from "@/lib/state/query-keys";

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CreateTaskValues) => {
      const result = await createTask(values);
      if ("error" in result && result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: async () => {
      const tasksKey = [...queryKeys.projects.root, "tasks"] as const;
      await queryClient.invalidateQueries({ queryKey: tasksKey });
      await queryClient.invalidateQueries({
        queryKey: [...queryKeys.projects.root, "tasks", projectId],
      });
      await queryClient.invalidateQueries({ queryKey: ["my-statistics"] });
      await queryClient.refetchQueries({ queryKey: tasksKey, type: "active" });
      await queryClient.refetchQueries({ queryKey: ["my-statistics"], type: "active" });
      toast.success("Task created successfully");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create task");
    },
  });
}

