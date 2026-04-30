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
import type { GetProjectTasksResult } from "@/lib/types/actions/products/tasks.type";
import type { ProjectTask } from "@/lib/types/project-tasks";

export async function getProjectTasks(
  projectId: string,
  opts?: { page?: number; pageSize?: number; searchTerm?: string },
): Promise<GetProjectTasksResult> {
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

    const tasks = (Array.isArray(data) ? data : []) as ProjectTask[];
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

