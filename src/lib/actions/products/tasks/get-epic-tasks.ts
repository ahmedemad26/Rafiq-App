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
import { TASK_STATUSES, type TaskStatus } from "@/lib/constants/task-status";
import type { GetEpicTasksResult } from "@/lib/types/actions/products/tasks.type";
import type { ProjectTask } from "@/lib/types/project-tasks";

function normalizeTaskStatus(value: unknown): TaskStatus | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase();
  return (TASK_STATUSES as readonly string[]).includes(normalized) ? (normalized as TaskStatus) : null;
}

function mapTaskRow(row: Record<string, unknown>): ProjectTask {
  return {
    id: String(row.id ?? ""),
    project_id: typeof row.project_id === "string" ? row.project_id : null,
    task_id: typeof row.task_id === "string" ? row.task_id : null,
    title: typeof row.title === "string" ? row.title : null,
    description: typeof row.description === "string" ? row.description : null,
    due_date: typeof row.due_date === "string" ? row.due_date : null,
    created_at: typeof row.created_at === "string" ? row.created_at : null,
    assignee_id: typeof row.assignee_id === "string" ? row.assignee_id : null,
    assignee_name: null,
    assignee_email: null,
    assignee_avatar: null,
    epic_id: typeof row.epic_id === "string" ? row.epic_id : null,
    priority: null,
    status: normalizeTaskStatus(row.status),
  };
}

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

    const url = new URL(`${supabase.url}/rest/v1/tasks`);
    url.searchParams.set(
      "select",
      "id,project_id,task_id,title,description,due_date,created_at,assignee_id,status,epic_id",
    );
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

    const rows = Array.isArray(data) ? (data as Array<Record<string, unknown>>) : [];
    return { data: rows.map(mapTaskRow) };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : NETWORK_ERROR_MESSAGE,
    };
  }
}
