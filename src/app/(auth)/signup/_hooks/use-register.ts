import { registerAction } from "@/lib/actions/auth.actions";
import { RegisterValues } from "@/lib/schemes/register-schema";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

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
    onError: (err) => {
      toast.error(err.message);
    },
  });
}