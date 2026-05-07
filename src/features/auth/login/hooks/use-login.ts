import { useMutation } from "@tanstack/react-query";
import { getSession, signIn } from "next-auth/react";
import type { LoginCredentials } from "@/lib/schemes/auth.shcema";

export default function useLogin() {
  const { error, isPending, isSuccess, mutate } = useMutation({
    mutationFn: async (values: LoginCredentials) => {
      const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl") || "/project";

      const response = await signIn("credentials", {
        ...values,
        redirect: false,
        callbackUrl,
      });

      if (response?.error) {
        throw new Error(response.error);
      }

      await getSession();
      window.location.assign(response?.url || callbackUrl);
    },
  });

  return { error, isPending, isSuccess, login: mutate };
}
