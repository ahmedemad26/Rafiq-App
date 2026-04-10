"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSession } from "next-auth/react";
import type { User } from "next-auth";
import { queryKeys } from "@/lib/state/query-keys";

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.user,
    queryFn: async () => {
      const session = await getSession();
      return session?.user ?? null;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSetCurrentUser() {
  const queryClient = useQueryClient();

  return (user: User | null) => {
    queryClient.setQueryData(queryKeys.auth.user, user);
  };
}

export function useUpdateCurrentUserCache() {
  const queryClient = useQueryClient();

  return (updates: Partial<User>) => {
    queryClient.setQueryData<User | null>(queryKeys.auth.user, (currentUser) => {
      if (!currentUser) return currentUser;

      return {
        ...currentUser,
        ...updates,
        app_metadata: {
          ...currentUser.app_metadata,
          ...updates.app_metadata,
        },
        user_metadata: {
          ...currentUser.user_metadata,
          ...updates.user_metadata,
        },
      };
    });
  };
}
