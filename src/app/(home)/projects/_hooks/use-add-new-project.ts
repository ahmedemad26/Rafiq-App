"use client";

import { useCreateProject } from "@/lib/state/projects";
import type { CreateProjectValues } from "@/lib/schemes/products-shema/add-project.shema";
import { toast } from "sonner";

// hook to add a new project
export function useAddNewProject() {
  const { mutate, isPending, error, isSuccess } = useCreateProject();

  return {
    mutate: (values: CreateProjectValues, onSuccess?: () => void) =>
      mutate(values, {
        onSuccess: () => {
          toast.success("Project created successfully");
          onSuccess?.();
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Failed to create project"
          );
        },
      }),
    isPending,
    error,
    isSuccess,
  };
}
