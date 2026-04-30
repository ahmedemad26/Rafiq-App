import { LoginCredentials } from '@/lib/schemes/auth.shcema';
import { useMutation } from '@tanstack/react-query';
import { signIn } from 'next-auth/react';

export default function useLogin() {
  const { error, isPending, isSuccess, mutate } = useMutation({
    mutationFn: async (values: LoginCredentials) => {
      const response = await signIn('credentials', {
        ...values,
        redirect: false,
      });
      if (response?.error) {
        throw new Error(response.error);
      }
      const callbackUrl = new URLSearchParams(window.location.search).get(
        'callbackUrl',
      );
      window.location.assign(callbackUrl || "/project");
    },
  });
  return { error, isPending, isSuccess, login: mutate };
}