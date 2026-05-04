"use server";

import {
  buildSupabaseHeaders,
  extractErrorMessage,
  getAccessToken,
  getSupabaseConfig,
  NETWORK_ERROR_MESSAGE,
  UNAUTHORIZED_MESSAGE,
} from "@/lib/actions/products/_utils/supabase-request";
import type { UpdateMemberRoleResult } from "@/lib/types/actions/products/members.type";

const ALLOWED_ROLES = ["owner", "admin", "member", "viewer"] as const;
type MemberRoleValue = (typeof ALLOWED_ROLES)[number];

function normalizeRole(role: string): MemberRoleValue | null {
  const normalized = role.trim().toLowerCase();
  return (ALLOWED_ROLES as readonly string[]).includes(normalized)
    ? (normalized as MemberRoleValue)
    : null;
}

export async function updateMemberRole(params: {
  projectId: string;
  userId: string;
  role: string;
}): Promise<UpdateMemberRoleResult> {
  const projectId = params.projectId?.trim();
  const userId = params.userId?.trim();
  const normalizedRole = normalizeRole(params.role ?? "");

  if (!projectId) return { error: "Project id is required." };
  if (!userId) return { error: "User id is required." };
  if (!normalizedRole) return { error: "Invalid role value." };

  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return { error: UNAUTHORIZED_MESSAGE, status: 401 };

    const supabase = getSupabaseConfig();
    if (supabase.error) return { error: supabase.error };
    if (!supabase.url || !supabase.anonKey) return { error: "Missing Supabase configuration." };

    const url = new URL(`${supabase.url}/rest/v1/project_members`);
    url.searchParams.set("project_id", `eq.${projectId}`);
    url.searchParams.set("user_id", `eq.${userId}`);
    url.searchParams.set("select", "user_id");

    const res = await fetch(url.toString(), {
      method: "PATCH",
      headers: buildSupabaseHeaders(accessToken, supabase.anonKey, {
        Prefer: "return=representation",
      }),
      body: JSON.stringify({ role: normalizedRole }),
      cache: "no-store",
    });

    const rawBody = await res.text();
    let data: unknown = null;
    if (rawBody) {
      try {
        data = JSON.parse(rawBody);
      } catch {
        return { error: "Invalid server response. Please check the API endpoint.", status: res.status };
      }
    }

    if (!res.ok) {
      return {
        error: extractErrorMessage(data, "Failed to update member role."),
        status: res.status,
      };
    }

    return { success: true, message: "Member role updated successfully." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : NETWORK_ERROR_MESSAGE,
    };
  }
}
