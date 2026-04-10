
import { ForgotPasswordAction } from "@/lib/actions/forgot-password.action";
import { ForgotPasswordValues } from "@/lib/schemes/forgot.shema";
import { useMutation } from "@tanstack/react-query";

export default function useForgotPassword() {
  return useMutation({
    mutationFn: async (values: ForgotPasswordValues) => {
      const payload = await ForgotPasswordAction(values);

      if (payload.error) {
        throw new Error(payload.error.message);
      }

      return payload;
    },
  });
}
