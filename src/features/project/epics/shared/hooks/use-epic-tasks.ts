"use client";

import { useQuery } from "@tanstack/react-query";
import { getEpicTasks } from "@/lib/actions/products/tasks/get-epic-tasks";
import type { ProjectTask } from "@/lib/types/project-tasks";
import { queryKeys } from "@/lib/state/query-keys";

export function useEpicTasks(opts: { epicId: string | null; enabled?: boolean }) {
  return useQuery({
    queryKey: [...queryKeys.projects.root, "epics", "tasks", opts.epicId] as const,
    queryFn: async () => {
      const result = await getEpicTasks(opts.epicId ?? "");
      if ("error" in result && result.error) {
        throw new Error(result.error);
      }
      return "data" in result ? result.data : ([] as ProjectTask[]);
    },
    enabled: Boolean(opts.epicId) && opts.enabled !== false,
  });
}
