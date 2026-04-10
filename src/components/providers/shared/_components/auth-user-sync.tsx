"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/state/query-keys";

export default function AuthUserSync() {
  const queryClient = useQueryClient();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    queryClient.setQueryData(queryKeys.auth.user, session?.user ?? null);
  }, [queryClient, session?.user, status]);

  return null;
}
