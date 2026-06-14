import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";

export const UNAUTHORIZED_MESSAGE = "Unauthorized. Please login again.";
export const INVALID_RESPONSE_MESSAGE = "Invalid server response. Please check the API endpoint.";
export const NETWORK_ERROR_MESSAGE = "Network error. Please try again.";
export const MISSING_SUPABASE_URL_MESSAGE = "Missing Supabase URL configuration.";
export const MISSING_SUPABASE_ANON_KEY_MESSAGE = "Missing Supabase anon key configuration.";

export async function getAccessToken(): Promise<string | null> {
  const session = await getServerSession(authOptions);

  // DEBUG مؤقت
  console.log("[auth] session user id:", session?.user?.id);
  console.log("[auth] access_token exists:", !!session?.user?.access_token);
  
  return session?.user?.access_token ?? null;
}

export function getSupabaseConfig():
  | { url: string; anonKey: string; error: null }
  | { url: null; anonKey: null; error: string } {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url?.trim()) {
    return { url: null, anonKey: null, error: MISSING_SUPABASE_URL_MESSAGE };
  }
  if (!anonKey?.trim()) {
    return { url: null, anonKey: null, error: MISSING_SUPABASE_ANON_KEY_MESSAGE };
  }

  return { url, anonKey, error: null };
}

export function buildSupabaseHeaders(
  accessToken: string,
  anonKey: string,
  extraHeaders?: Record<string, string>,
): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    apikey: anonKey,
    Authorization: `Bearer ${accessToken}`,
    ...extraHeaders,
  };
}

export async function parseJsonResponseBody(
  response: Response,
): Promise<{ data: unknown; parseError: string | null }> {
  const rawBody = await response.text();
  if (!rawBody) {
    return { data: null, parseError: null };
  }

  try {
    return { data: JSON.parse(rawBody), parseError: null };
  } catch {
    return { data: null, parseError: INVALID_RESPONSE_MESSAGE };
  }
}

export function extractErrorMessage(data: unknown, fallback: string): string {
  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof (data as Record<string, unknown>).message === "string"
  ) {
    return String((data as Record<string, unknown>).message);
  }
  return fallback;
}
