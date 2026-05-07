import { useMutation } from "@tanstack/react-query";
import { CreateNewPasswordAction } from "@/lib/actions/create-new-password.action";
import type { CreateNewPasswordValues } from "@/lib/schemes/create-new-password.shema";

export default function useResetPassword(accessToken: string) {
  return useMutation({
    mutationFn: async (values: CreateNewPasswordValues) => {
      const payload = await CreateNewPasswordAction(values, accessToken);
      if (payload.error) {
        throw new Error(payload.error.message);
      }

      return payload;
    },
  });
}
