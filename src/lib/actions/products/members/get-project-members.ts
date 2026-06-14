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

type ProfileInfo = {
  name: string;
  email: string;
  avatarUrl: string | null;
};

function mergeProfileInfo(existing: ProfileInfo | undefined, incoming: ProfileInfo): ProfileInfo {
  return {
    name: existing?.name?.trim() || incoming.name?.trim() || "",
    email: existing?.email?.trim() || incoming.email?.trim() || "",
    avatarUrl: existing?.avatarUrl?.trim() || incoming.avatarUrl?.trim() || null,
  };
}

function mapProfileRow(row: Record<string, unknown>): { userId: string; profile: ProfileInfo } | null {
  const userId =
    pickUuid(row, ["id", "user_id", "sub"]) ??
    null;
  if (!userId) return null;

  const rawMeta = (row.raw_user_meta_data ?? row.user_metadata) as Record<string, unknown> | undefined;

  return {
    userId,
    profile: {
      name:
        pickFirstString(row, ["full_name", "display_name", "name", "user_name"]) ||
        pickFirstString(rawMeta ?? {}, ["full_name", "display_name", "name", "user_name"]) ||
        "",
      email:
        pickFirstString(row, ["email", "user_email"]) ||
        pickFirstString(rawMeta ?? {}, ["email", "user_email"]) ||
        "",
      avatarUrl:
        pickFirstString(row, ["avatar_url", "avatarUrl", "image", "avatar"]) ||
        pickFirstString(rawMeta ?? {}, ["avatar_url", "avatarUrl", "image", "avatar"]) ||
        null,
    },
  };
}

async function fetchProfilesByUserIds(
  baseUrl: string,
  accessToken: string,
  anonKey: string,
  userIds: string[],
): Promise<Map<string, ProfileInfo>> {
  const profilesByUserId = new Map<string, ProfileInfo>();
  if (!userIds.length) return profilesByUserId;

  const filter = `in.(${userIds.join(",")})`;
  const endpoints: Array<{ table: string; column: string }> = [
    { table: "auth.users", column: "id" },
    { table: "profiles", column: "id" },
  ];

  for (const { table, column } of endpoints) {
    const url = new URL(`${baseUrl}/rest/v1/${table}`);
    url.searchParams.set(column, filter);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: buildSupabaseHeaders(accessToken, anonKey),
      cache: "no-store",
    });

    if (!res.ok) continue;

    const { data } = await parseJsonResponseBody(res);
    const rows = Array.isArray(data) ? (data as Array<Record<string, unknown>>) : [];

    for (const row of rows) {
      const mapped = mapProfileRow(row);
      if (!mapped) continue;

      const existing = profilesByUserId.get(mapped.userId);
      profilesByUserId.set(mapped.userId, mergeProfileInfo(existing, mapped.profile));
    }
  }

  return profilesByUserId;
}

function mapMemberRow(
  row: Record<string, unknown>,
  index: number,
  projectId: string,
  profilesByUserId: Map<string, ProfileInfo>,
): ProjectMember {
  const userId = pickUuid(row, ["user_id", "userId", "auth_user_id"]);
  const profile = userId ? profilesByUserId.get(userId) : undefined;

  return {
    id: String(row.id ?? userId ?? `${projectId}-${index}`),
    userId,
    name: profile?.name ?? "",
    email: profile?.email ?? "",
    role: normalizeRole(row.role),
    avatarUrl: profile?.avatarUrl ?? null,
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

    const url = new URL(`${supabase.url}/rest/v1/project_members`);
    url.searchParams.set("project_id", `eq.${projectId}`);
    url.searchParams.set("select", "id,project_id,user_id,role,created_at");
    url.searchParams.set("order", "created_at.asc");

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
    console.log("[getProjectMembers] rows", rows);

    const userIds = rows
      .map((row) => pickUuid(row, ["user_id", "userId", "auth_user_id"]))
      .filter((value): value is string => Boolean(value));

    const profilesByUserId = await fetchProfilesByUserIds(
      supabase.url,
      accessToken,
      supabase.anonKey,
      userIds,
    );

    console.log("[getProjectMembers] profilesByUserId", Object.fromEntries(profilesByUserId));

    const members = rows.map((row, index) =>
      mapMemberRow(row, index, projectId, profilesByUserId),
    );

    console.log("[getProjectMembers] members", members);

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
