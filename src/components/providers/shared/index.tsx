import NextAuthProvider from "./_components/next-auth.provider";
import ReactQueryProviders from "./_components/react-query.provider";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import AuthUserSync from "./_components/auth-user-sync";
import { Toaster } from "@/components/ui/sonner";

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProviders>
      {/* DevTools */}
      <ReactQueryDevtools />
      <NextAuthProvider>
        <AuthUserSync />
        {children}
        <Toaster />
      </NextAuthProvider>
    </ReactQueryProviders>
  );
}
