
import { registerAction } from "@/lib/actions/auth.actions";
import { RegisterValues } from "@/lib/schemes/register-schema";
import { useMutation } from "@tanstack/react-query";

export default function useRegister() {
  return useMutation({
    mutationFn: async (values: RegisterValues) => {
      const payload = await registerAction(values);

      if (payload.error) {
        throw new Error(payload.error.message);
      }

      return payload;
    },
  });
}
