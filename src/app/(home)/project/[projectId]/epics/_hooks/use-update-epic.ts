"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateEpic } from "@/lib/actions/products/epics/update-epic";
import { queryKeys } from "@/lib/state/query-keys";
import type { UpdateEpicPatch } from "@/lib/types/actions/products/epics.type";

type UseUpdateEpicArgs = {
  epicId: string;
  patch: UpdateEpicPatch;
};

export function useUpdateEpic() {
  const queryClient = useQueryClient();

  // Derive once — used in mutationFn, onMutate, onSuccess, onError
  const epicsQueryKey = [...queryKeys.projects.root, "epics"] as const;

  return useMutation<true, Error, UseUpdateEpicArgs, { previousEpics: unknown }>({
    mutationFn: async ({ epicId, patch }) => {
      const result = await updateEpic(epicId, patch);
      if ("error" in result) throw new Error(result.error);
      return result.data;
    },

    // Optimistic update — snapshot current cache, update immediately
    onMutate: async ({ patch }) => {
      await queryClient.cancelQueries({ queryKey: epicsQueryKey });
      const previousEpics = queryClient.getQueryData(epicsQueryKey);
      queryClient.setQueryData(epicsQueryKey, (old: unknown) => {
        // Consumers can shape this more precisely once the cache type is known
        if (!Array.isArray(old)) return old;
        return old.map((epic: Record<string, unknown>) =>
          epic.id === patch ? { ...epic, ...patch } : epic
        );
      });
      return { previousEpics };
    },

    onSuccess: () => {
      // Invalidate so next background fetch brings fresh server data
      queryClient.invalidateQueries({ queryKey: epicsQueryKey });
      toast.success("Epic updated successfully.");
    },

    onError: (error, _variables, context) => {
      // Roll back optimistic update
      if (context?.previousEpics !== undefined) {
        queryClient.setQueryData(epicsQueryKey, context.previousEpics);
      }
      toast.error(error.message ?? "Failed to update epic. Please try again.");
    },
  });
}