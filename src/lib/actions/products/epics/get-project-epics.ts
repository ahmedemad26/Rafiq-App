"use server";

import {
  buildSupabaseHeaders,
  getAccessToken,
  getSupabaseConfig,
  NETWORK_ERROR_MESSAGE,
  parseJsonResponseBody,
  UNAUTHORIZED_MESSAGE,
} from "@/lib/actions/products/_utils/supabase-request";
import { getProjectMembers } from "@/lib/actions/products/members/get-project-members";
import {
  GetProjectEpicsParams,
  GetProjectEpicsSuccess,
  ProjectEpic,
  type EpicUser,
} from "@/lib/types/epics";
import type { ProjectMember } from "@/lib/types/member";

export type GetProjectEpicsResult = { error: string } | GetProjectEpicsSuccess;

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

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

function toEpicUser(value: unknown): EpicUser | null {
  const record = asRecord(value);
  if (!record) return null;

  const sub = pickUuid(record, ["sub", "id", "user_id"]) ?? "";
  const name = pickFirstString(record, ["name", "full_name", "display_name"]);
  const email = pickFirstString(record, ["email"]);
  const department = pickFirstString(record, ["department"]);

  if (!sub && !name && !email) return null;

  return { sub, name, email, department };
}

function memberToEpicUser(member: ProjectMember): EpicUser {
  return {
    sub: member.userId ?? "",
    name: member.name,
    email: member.email,
    department: "",
  };
}

function buildMembersByUserId(members: ProjectMember[]): Map<string, ProjectMember> {
  return new Map(
    members
      .filter((member) => member.userId)
      .map((member) => [member.userId as string, member]),
  );
}

function mapEpicRow(
  row: Record<string, unknown>,
  membersByUserId: Map<string, ProjectMember>,
): ProjectEpic {
  const assigneeFromView = toEpicUser(row.assignee);
  const createdByFromView = toEpicUser(row.created_by);

  const assigneeId = pickUuid(row, ["assignee_id"]);
  const createdById = pickUuid(row, ["created_by_id", "created_by", "user_id", "owner_id"]);

  const assignee =
    assigneeFromView ??
    (assigneeId && membersByUserId.has(assigneeId)
      ? memberToEpicUser(membersByUserId.get(assigneeId)!)
      : null);

  const created_by =
    createdByFromView ??
    (createdById && membersByUserId.has(createdById)
      ? memberToEpicUser(membersByUserId.get(createdById)!)
      : null);

  return {
    id: String(row.id ?? ""),
    epic_id: String(row.epic_id ?? ""),
    title: String(row.title ?? ""),
    description: typeof row.description === "string" ? row.description : null,
    deadline: typeof row.deadline === "string" ? row.deadline : null,
    created_at: typeof row.created_at === "string" ? row.created_at : null,
    created_by,
    assignee,
  };
}

export async function getProjectEpics(
  params: GetProjectEpicsParams,
): Promise<GetProjectEpicsResult> {
  const { projectId, limit, offset, searchTerm } = params;

  if (!projectId) return { error: "Project id is required." };
  if (limit < 1 || limit > 100) return { error: "Invalid limit." };
  if (offset < 0) return { error: "Invalid offset." };

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

    const url = new URL(`${supabase.url}/rest/v1/epics`);
    url.searchParams.set("project_id", `eq.${projectId}`);
    if (searchTerm?.trim()) {
      url.searchParams.set("title", `ilike.%${searchTerm.trim()}%`);
    }
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("offset", String(offset));
    url.searchParams.set("order", "created_at.desc");

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: buildSupabaseHeaders(accessToken, supabase.anonKey, {
        Prefer: "count=exact",
      }),
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
          : "Failed to search epics";
      return { error: message };
    }

    const membersResult = await getProjectMembers(projectId);
    const membersByUserId = buildMembersByUserId(
      "data" in membersResult && membersResult.data ? membersResult.data : [],
    );

    const rows = Array.isArray(data) ? (data as Array<Record<string, unknown>>) : [];
    const epics = rows.map((row) => mapEpicRow(row, membersByUserId));

    const contentRange = res.headers.get("content-range");
    const totalStr = contentRange?.split("/")?.[1] ?? "0";
    const totalCount = Number.parseInt(totalStr, 10);
    const rangePart = contentRange?.split("/")?.[0] ?? "";
    const [startRaw, endRaw] = rangePart.split("-");
    const start = Number.parseInt(startRaw ?? "", 10);
    const end = Number.parseInt(endRaw ?? "", 10);
    const range =
      Number.isFinite(start) && Number.isFinite(end)
        ? {
            start,
            end,
          }
        : null;

    return {
      data: epics,
      totalCount: Number.isFinite(totalCount) ? totalCount : 0,
      range,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : NETWORK_ERROR_MESSAGE,
    };
  }
}
