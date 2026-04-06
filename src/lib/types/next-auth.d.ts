import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface UserMetadata {
    department: string;
    email: string;
    email_verified: boolean;
    name: string;
    phone_verified: boolean;
    sub: string;
  }

  interface AppMetadata {
    provider: string;
    providers: string[];
  }

  interface User {
    id: string;
    aud: string;
    role: string;
    email: string;
    email_confirmed_at: string;
    phone: string;
    confirmed_at: string;
    last_sign_in_at: string;
    app_metadata: AppMetadata;
    user_metadata: UserMetadata;
    created_at: string;
    updated_at: string;
    is_anonymous: boolean;
    access_token: string;
  }

  export interface AuthResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    expires_at: number;
    refresh_token: string;
    user: User;
    weak_password: null;
  }

  interface Session {
    user: User;
    access_token: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: User;
    access_token: string;
  }
}