"use server";

import {
  buildSupabaseHeaders,
  getAccessToken,
  getSupabaseConfig,
  NETWORK_ERROR_MESSAGE,
  parseJsonResponseBody,
  UNAUTHORIZED_MESSAGE,
} from "@/lib/actions/products/_utils/supabase-request";
import { type ProjectMember } from "@/lib/types/member";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function pickFirstString(source: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function pickUuid(source: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = source[key];
    if (typeof value !== "string") continue;
    const normalized = value.trim();
    if (UUID_REGEX.test(normalized)) return normalized;
  }
  return null;
}

function normalizeRole(value: unknown): ProjectMember["role"] {
  const role = String(value ?? "")
    .trim()
    .toLowerCase();

  if (role === "owner") return "Owner";
  if (role === "admin") return "Admin";
  if (role === "viewer") return "Viewer";
  return "Member";
}


function mapMemberRow(
  row: Record<string, unknown>,
  index: number,
  projectId: string,
): ProjectMember {
  const userId = pickUuid(row, ["user_id", "userId", "auth_user_id"]);
  const metadata = (row.metadata ?? {}) as Record<string, unknown>;

  return {
    id: String(row.member_id ?? userId ?? `${projectId}-${index}`),
    userId,
    name: pickFirstString(metadata, ["name", "full_name", "display_name"]) || "",
    email: pickFirstString(metadata, ["email", "user_email"]) || String(row.email ?? ""),
    role: normalizeRole(row.role),
    avatarUrl: pickFirstString(metadata, ["avatar_url", "avatarUrl"]) || null,
  };
}

export async function getProjectMembers(projectId: string) {
  if (!projectId) {
    return { error: "Project id is required." };
  }

  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { error: UNAUTHORIZED_MESSAGE };
    }

    const supabase = getSupabaseConfig();
    if (supabase.error) return { error: supabase.error };
    if (!supabase.url || !supabase.anonKey) {
      return { error: "Missing Supabase configuration." };
    }

    const url = new URL(`${supabase.url}/rest/v1/get_project_members`);
    url.searchParams.set("project_id", `eq.${projectId}`);
    url.searchParams.set("select", "member_id,project_id,user_id,role,email,metadata");

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: buildSupabaseHeaders(accessToken, supabase.anonKey),
      cache: "no-store",
    });

    const { data, parseError } = await parseJsonResponseBody(res);
    if (parseError) return { error: parseError };

    if (!res.ok) {
      const message =
        data &&
        typeof data === "object" &&
        "message" in data &&
        typeof (data as { message: unknown }).message === "string"
          ? (data as { message: string }).message
          : "Failed to load project members. Please try again.";
      return { error: message };
    }

    const rows = Array.isArray(data) ? (data as Array<Record<string, unknown>>) : [];

    const members = rows.map((row, index) => mapMemberRow(row, index, projectId));

    const deduped = Array.from(
      members.reduce((acc, item) => {
        const key = item.userId || item.email.toLowerCase() || item.id;
        if (!acc.has(key)) acc.set(key, item);
        return acc;
      }, new Map<string, ProjectMember>()),
    ).map((entry) => entry[1]);

    return { data: deduped };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : NETWORK_ERROR_MESSAGE,
    };
  }
}
