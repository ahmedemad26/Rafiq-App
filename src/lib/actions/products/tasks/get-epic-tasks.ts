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
import type { GetEpicTasksResult } from "@/lib/types/actions/products/tasks.type";
import type { ProjectTask } from "@/lib/types/project-tasks";

export async function getEpicTasks(epicId: string): Promise<GetEpicTasksResult> {
  if (!epicId?.trim()) return { error: "Epic id is required." };

  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return { error: UNAUTHORIZED_MESSAGE };
    }

    const supabase = getSupabaseConfig();
    if (supabase.error) return { error: supabase.error };
    if (!supabase.url || !supabase.anonKey) return { error: "Missing Supabase configuration." };

    const url = new URL(`${supabase.url}/rest/v1/project_tasks`);
    url.searchParams.set("epic_id", `eq.${epicId}`);
    url.searchParams.set("order", "created_at.desc");

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: buildSupabaseHeaders(accessToken, supabase.anonKey),
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
    return { data: tasks };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : NETWORK_ERROR_MESSAGE,
    };
  }
}

