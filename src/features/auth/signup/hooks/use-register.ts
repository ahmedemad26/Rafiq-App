import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { registerAction } from "@/lib/actions/auth.actions";
import type { RegisterValues } from "@/lib/schemes/register-schema";

export default function useRegister() {
  return useMutation({
    mutationFn: async (values: RegisterValues) => {
      const payload = await registerAction(values);
      if (payload.error) {
        throw new Error(payload.error.message);
      }

      return payload;
    },
    onSuccess: () => {
      toast.success("Account created successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
