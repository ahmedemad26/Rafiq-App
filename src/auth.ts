import { AuthResponse, NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const supabaseUrl =
          process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey =
          process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error("Missing Supabase environment variables");
        }

        const response = await fetch(
          `${supabaseUrl}/auth/v1/token?grant_type=password`,
          {
            method: "POST",
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
            headers: {
              "Content-Type": "application/json",
              apikey: supabaseAnonKey,
              Authorization: `Bearer ${supabaseAnonKey}`,
            }
          },
        );

        const payload = (await response.json()) as Partial<AuthResponse> & {
          msg?: string;
          message?: string;
        };

        if (!response.ok) {
          const errorMessage = payload.msg ?? payload.message;
          throw new Error(errorMessage ?? "Invalid credentials");
        }

        const authPayload = payload as AuthResponse;
        return {
          ...authPayload.user,
          access_token: authPayload.access_token,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.user = user;
        token.access_token = user.access_token;
      }
      return token;
    },
    session({ session, token }) {
      session.user = token.user;
      return session;
    },
  },
};
