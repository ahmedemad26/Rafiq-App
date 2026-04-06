import NextAuthProvider from "./_components/next-auth.provider";
import ReactQueryProviders from "./_components/react-query.provider";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProviders>
      {/* DevTools */}
      <ReactQueryDevtools />
      <NextAuthProvider>{children}</NextAuthProvider>
    </ReactQueryProviders>
  );
}
