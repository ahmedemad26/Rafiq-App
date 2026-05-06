"use server";

import { authOptions } from "@/auth";
import { getSupabaseConfig } from "@/lib/actions/products/_utils/supabase-request";
import { type ProjectMember } from "@/lib/types/member";
import { getServerSession } from "next-auth";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function pickFirstString(
  source: Record<string, unknown>,
  keys: string[],
): string {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
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

function pickUuid(source: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = source[key];
    if (typeof value !== "string") continue;
    const normalized = value.trim();
    if (UUID_REGEX.test(normalized)) return normalized;
  }
  return null;
}

export async function getProjectMembers(projectId: string) {
  if (!projectId) {
    return { error: "Project id is required." };
  }

  try {
    const session = await getServerSession(authOptions);
    const accessToken = session?.user?.access_token;

    if (!accessToken) {
      return { error: "Unauthorized. Please login again." };
    }

    const supabase = getSupabaseConfig();
    if (supabase.error) return { error: supabase.error };
    if (!supabase.url || !supabase.anonKey) return { error: "Missing Supabase configuration." };

    const url = new URL(`${supabase.url}/rest/v1/get_project_members`);
    url.searchParams.set("project_id", `eq.${projectId}`);

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
    let data: unknown = null;

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
          : "Failed to load project members. Please try again.";
      return { error: message };
    }

    const rows = Array.isArray(data) ? (data as Array<Record<string, unknown>>) : [];
    const members = rows.map((row, index) => {
      const user = asRecord(row.user);
      const profile = asRecord(row.profile);
      const member = asRecord(row.member);

      const name =
        pickFirstString(row, ["full_name", "display_name", "name", "user_name"]) ||
        (user ? pickFirstString(user, ["full_name", "display_name", "name"]) : "") ||
        (profile ? pickFirstString(profile, ["full_name", "display_name", "name"]) : "") ||
        (member ? pickFirstString(member, ["full_name", "display_name", "name"]) : "");

      const email =
        pickFirstString(row, ["email", "user_email"]) ||
        (user ? pickFirstString(user, ["email"]) : "") ||
        (profile ? pickFirstString(profile, ["email"]) : "") ||
        (member ? pickFirstString(member, ["email"]) : "");

      const userId =
        pickUuid(row, ["user_id", "userId", "auth_user_id", "member_user_id", "sub"]) ??
        (user ? pickUuid(user, ["id", "user_id", "userId", "sub"]) : null) ??
        (member ? pickUuid(member, ["user_id", "userId", "auth_user_id", "sub"]) : null) ??
        (profile ? pickUuid(profile, ["user_id", "userId", "id", "sub"]) : null) ??
        null;

      return {
        id: String(row.id ?? row.member_id ?? userId ?? `${projectId}-${index}`),
        userId,
        name,
        email,
        role: normalizeRole(row.role),
        avatarUrl:
          typeof row.avatar_url === "string" && row.avatar_url.trim()
            ? row.avatar_url.trim()
            : typeof row.avatarUrl === "string" && row.avatarUrl.trim()
              ? row.avatarUrl.trim()
              : null,
      } satisfies ProjectMember;
    });

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
      error: error instanceof Error ? error.message : "Network error. Please try again.",
    };
  }
}
