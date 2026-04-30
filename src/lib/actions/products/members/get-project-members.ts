"use server";

import { authOptions } from "@/auth";
import { getSupabaseConfig } from "@/lib/actions/products/_utils/supabase-request";
import { type ProjectMember } from "@/lib/types/member";
import { getServerSession } from "next-auth";

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
    const members: ProjectMember[] = rows.map((row, index) => ({
      ...(() => {
        const user = asRecord(row.user);
        const profile = asRecord(row.profile);
        const member = asRecord(row.member);

        const name =
          pickFirstString(row, ["name", "full_name", "display_name", "user_name"]) ||
          (user ? pickFirstString(user, ["name", "full_name", "display_name"]) : "") ||
          (profile ? pickFirstString(profile, ["name", "full_name", "display_name"]) : "") ||
          (member ? pickFirstString(member, ["name", "full_name", "display_name"]) : "");

        const email =
          pickFirstString(row, ["email", "user_email"]) ||
          (user ? pickFirstString(user, ["email"]) : "") ||
          (profile ? pickFirstString(profile, ["email"]) : "") ||
          (member ? pickFirstString(member, ["email"]) : "");

        return { name, email };
      })(),
      id: String(row.id ?? row.member_id ?? `${projectId}-${index}`),
      userId:
        row.user_id == null && row.userId == null
          ? null
          : String(row.user_id ?? row.userId ?? "").trim(),
      role: normalizeRole(row.role),
      avatarUrl:
        typeof row.avatar_url === "string" && row.avatar_url.trim()
          ? row.avatar_url.trim()
          : typeof row.avatarUrl === "string" && row.avatarUrl.trim()
            ? row.avatarUrl.trim()
            : null,
    }));

    return { data: members };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Network error. Please try again.",
    };
  }
}
