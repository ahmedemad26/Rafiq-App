"use server";

import { authOptions } from "@/auth";
import { getSupabaseConfig } from "@/lib/actions/products/_utils/supabase-request";
import type { ProjectInvitation } from "@/lib/types/member";
import { getServerSession } from "next-auth";

export async function getProjectInvitations(projectId: string) {
  if (!projectId) {
    return { error: "Project id is required." };
  }

  try {
    const session = await getServerSession(authOptions);
    const accessToken = session?.user?.access_token;
    if (!accessToken) return { error: "Unauthorized. Please login again." };

    const supabase = getSupabaseConfig();
    if (supabase.error) return { error: supabase.error };
    if (!supabase.url || !supabase.anonKey) return { error: "Missing Supabase configuration." };

    const url = new URL(`${supabase.url}/rest/v1/project_invitations`);
    url.searchParams.set("select", "id,email,created_at,expires_at");
    url.searchParams.set("project_id", `eq.${projectId}`);
    url.searchParams.set("order", "created_at.desc");
    url.searchParams.set("limit", "20");

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        apikey: supabase.anonKey,
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    const rawBody = await res.text();
    let data: unknown = [];
    if (rawBody) {
      try {
        data = JSON.parse(rawBody);
      } catch {
        return { error: "Invalid server response. Please check the API endpoint." };
      }
    }

    if (!res.ok) {
      const message =
        data &&
        typeof data === "object" &&
        "message" in data &&
        typeof (data as { message: unknown }).message === "string"
          ? (data as { message: string }).message
          : "Failed to load pending invitations.";
      return { error: message };
    }

    const rows = Array.isArray(data) ? (data as Array<Record<string, unknown>>) : [];
    const invitations: ProjectInvitation[] = rows.map((row, index) => ({
      id: String(row.id ?? `${projectId}-${index}`),
      email: typeof row.email === "string" ? row.email : "",
      createdAt: typeof row.created_at === "string" ? row.created_at : null,
      expiresAt: typeof row.expires_at === "string" ? row.expires_at : null,
    }));

    return { data: invitations };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Network error. Please try again.",
    };
  }
}
