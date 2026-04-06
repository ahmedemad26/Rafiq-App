import { LoginValues } from '@/lib/schemes/auth.shcema';
import { useMutation } from '@tanstack/react-query';
import { signIn } from 'next-auth/react';

export default function useLogin() {
  const { error, isPending, mutate } = useMutation({
    mutationFn: async (values: LoginValues) => {
      const response = await signIn('credentials', {
        ...values,
        redirect: false,
      });
      if (response?.error) {
        throw new Error(response.error);
      }
      const callbackUrl = new URLSearchParams(location.search).get('callbackUrl');
      window.location.href = callbackUrl || '/';
    },
  });
  return { error, isPending, login: mutate };
}
