"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createEpic } from "@/lib/actions/products/epics/add-epic";
import type { CreateEpicValues } from "@/lib/schemes/products-shema/create-epic.shema";
import { queryKeys } from "@/lib/state/query-keys";

export function useCreateEpic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CreateEpicValues) => {
      const result = await createEpic(values);
      if ("error" in result && result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: async () => {
      const epicsQueryKey = [...queryKeys.projects.root, "epics"] as const;
      await queryClient.invalidateQueries({ queryKey: epicsQueryKey });
      await queryClient.refetchQueries({ queryKey: epicsQueryKey, type: "active" });
      toast.success("Epic created successfully");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create epic");
    },
  });
}
