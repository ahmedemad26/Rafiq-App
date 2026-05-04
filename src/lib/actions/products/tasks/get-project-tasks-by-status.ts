"use server";

import {
  buildSupabaseHeaders,
  extractErrorMessage,
  getAccessToken,
  getSupabaseConfig,
  NETWORK_ERROR_MESSAGE,
  parseJsonResponseBody,
  UNAUTHORIZED_MESSAGE,
} from "@/lib/actions/products/_utils/supabase-request";
import type { TaskStatus } from "@/lib/constants/task-status";
import type { GetProjectTasksByStatusResult } from "@/lib/types/actions/products/tasks.type";
import type { ProjectTask } from "@/lib/types/project-tasks";

function pickString(row: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

export async function getProjectTasksByStatus(
  projectId: string,
  status: TaskStatus,
  opts?: { page?: number; pageSize?: number; searchTerm?: string },
): Promise<GetProjectTasksByStatusResult> {
  if (!projectId?.trim()) return { error: "Project id is required." };
  const page = Math.max(1, opts?.page ?? 1);
  const pageSize = Math.max(1, opts?.pageSize ?? 10);
  const offset = (page - 1) * pageSize;
  const searchTerm = opts?.searchTerm?.trim() ?? "";

  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return { error: UNAUTHORIZED_MESSAGE };
    }

    const supabase = getSupabaseConfig();
    if (supabase.error) return { error: supabase.error };
    if (!supabase.url || !supabase.anonKey) return { error: "Missing Supabase configuration." };

    const url = new URL(`${supabase.url}/rest/v1/project_tasks`);
    url.searchParams.set("project_id", `eq.${projectId}`);
    url.searchParams.set("status", `eq.${status}`);
    if (searchTerm) {
      url.searchParams.set("title", `ilike.%${searchTerm}%`);
    }
    url.searchParams.set("order", "created_at.desc");
    url.searchParams.set("offset", String(offset));
    url.searchParams.set("limit", String(pageSize));

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: buildSupabaseHeaders(accessToken, supabase.anonKey, { Prefer: "count=exact" }),
      cache: "no-store",
    });

    const { data, parseError } = await parseJsonResponseBody(res);
    if (parseError) return { error: parseError };

    if (!res.ok) {
      return {
        error: extractErrorMessage(data, "Failed to load tasks. Please try again."),
      };
    }

    const rows = Array.isArray(data) ? (data as Array<Record<string, unknown>>) : [];
    const tasks: ProjectTask[] = rows.map((row) => ({
      id: String(row.id ?? ""),
      project_id: pickString(row, ["project_id"]),
      task_id: pickString(row, ["task_id"]),
      title: pickString(row, ["title"]),
      description: pickString(row, ["description"]),
      due_date: pickString(row, ["due_date"]),
      created_at: pickString(row, ["created_at"]),
      assignee_id: pickString(row, ["assignee_id", "assignee_user_id", "assigned_to", "user_id"]),
      assignee_name: pickString(row, ["assignee_name", "assignee_full_name", "assigned_to_name"]),
      assignee_email: pickString(row, ["assignee_email", "assignee_mail", "assigned_to_email"]),
      assignee_avatar: pickString(row, ["assignee_avatar", "assignee_avatar_url", "assignee_image"]),
      reporter_name: pickString(row, ["reporter_name", "creator_name", "created_by_name"]),
      reporter_avatar: pickString(row, ["reporter_avatar", "creator_avatar", "created_by_avatar"]),
      epic_id: pickString(row, ["epic_id"]),
      priority: pickString(row, ["priority"]),
      status: pickString(row, ["status"]) as TaskStatus | null,
    }));
    const contentRange = res.headers.get("content-range");
    const totalStr = contentRange?.split("/")?.[1] ?? "0";
    const total = Number.parseInt(totalStr, 10);
    return { data: tasks, total: Number.isFinite(total) ? total : 0 };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : NETWORK_ERROR_MESSAGE,
    };
  }
}

