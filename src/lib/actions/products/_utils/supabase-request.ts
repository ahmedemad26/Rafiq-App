import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";

export const UNAUTHORIZED_MESSAGE = "Unauthorized. Please login again.";
export const INVALID_RESPONSE_MESSAGE = "Invalid server response. Please check the API endpoint.";
export const NETWORK_ERROR_MESSAGE = "Network error. Please try again.";

export async function getAccessToken(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.access_token ?? null;
}

export function buildSupabaseHeaders(
  accessToken: string,
  extraHeaders?: Record<string, string>,
): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    apikey: process.env.SUPABASE_ANON_KEY!,
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
