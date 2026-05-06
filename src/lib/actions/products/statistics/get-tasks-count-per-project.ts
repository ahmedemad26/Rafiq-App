"use server";

import {
  NETWORK_ERROR_MESSAGE,
  UNAUTHORIZED_MESSAGE,
  buildSupabaseHeaders,
  extractErrorMessage,
  getAccessToken,
  getSupabaseConfig,
  parseJsonResponseBody,
} from "@/lib/actions/products/_utils/supabase-request";
import type { TasksPerProjectInput, TasksPerProjectRow } from "@/lib/types/statistics";

type GetTasksCountPerProjectResult =
  | { data: TasksPerProjectRow[] }
  | { error: string };

function buildPayloadCandidates(payload: TasksPerProjectInput): Array<Record<string, unknown>> {
  return [
    {
      p_start_date: payload.p_start_date,
      p_end_date: payload.p_end_date,
    },
    {
      start_date: payload.p_start_date,
      end_date: payload.p_end_date,
    },
  ];
}

function isFunctionSignatureError(message: string): boolean {
  return (
    message.includes("Could not find the function") ||
    message.includes("function public.get_tasks_count_per_project")
  );
}

function toDateKey(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

async function fallbackFromTasksTable(
  supabaseUrl: string,
  headers: Record<string, string>,
  payload: TasksPerProjectInput,
): Promise<GetTasksCountPerProjectResult> {
  const tasksUrl = new URL(`${supabaseUrl}/rest/v1/tasks`);
  tasksUrl.searchParams.set("select", "project_id,due_date,created_at");
  tasksUrl.searchParams.set("limit", "5000");

  const tasksResponse = await fetch(tasksUrl.toString(), {
    method: "GET",
    headers,
    cache: "no-store",
  });
  const { data: tasksData, parseError: tasksParseError } = await parseJsonResponseBody(tasksResponse);
  if (tasksParseError) return { error: tasksParseError };
  if (!tasksResponse.ok) {
    return {
      error: extractErrorMessage(tasksData, "Failed to load task counts per project."),
    };
  }

  const projectsUrl = new URL(`${supabaseUrl}/rest/v1/projects`);
  projectsUrl.searchParams.set("select", "id,name");
  projectsUrl.searchParams.set("limit", "5000");

  const projectsResponse = await fetch(projectsUrl.toString(), {
    method: "GET",
    headers,
    cache: "no-store",
  });
  const { data: projectsData, parseError: projectsParseError } = await parseJsonResponseBody(projectsResponse);
  if (projectsParseError) return { error: projectsParseError };
  if (!projectsResponse.ok) {
    return {
      error: extractErrorMessage(projectsData, "Failed to load task counts per project."),
    };
  }

  const projectsRows = Array.isArray(projectsData) ? (projectsData as Array<Record<string, unknown>>) : [];
  const projectNameMap = new Map<string, string>();
  projectsRows.forEach((row) => {
    const id = typeof row.id === "string" ? row.id : "";
    const name = typeof row.name === "string" ? row.name : "";
    if (id) projectNameMap.set(id, name || "Unknown project");
  });

  const tasksRows = Array.isArray(tasksData) ? (tasksData as Array<Record<string, unknown>>) : [];
  const counts = new Map<string, number>();

  for (const row of tasksRows) {
    const projectId = typeof row.project_id === "string" ? row.project_id : "";
    if (!projectId) continue;
    const dueDateKey = toDateKey(typeof row.due_date === "string" ? row.due_date : null);
    const createdDateKey = toDateKey(typeof row.created_at === "string" ? row.created_at : null);
    const dayKey = dueDateKey ?? createdDateKey;
    if (!dayKey) continue;
    if (dayKey < payload.p_start_date || dayKey > payload.p_end_date) continue;
    counts.set(projectId, Number(counts.get(projectId) ?? 0) + 1);
  }

  const result: TasksPerProjectRow[] = Array.from(counts.entries())
    .map(([project_id, tasks_count]) => ({
      project_id,
      project_name: projectNameMap.get(project_id) ?? "Unknown project",
      tasks_count,
    }))
    .sort((a, b) => b.tasks_count - a.tasks_count);

  return { data: result };
}

export async function getTasksCountPerProject(
  payload: TasksPerProjectInput,
): Promise<GetTasksCountPerProjectResult> {
  try {
    if (!payload.p_start_date || !payload.p_end_date) {
      return { error: "Start and end dates are required." };
    }

    const accessToken = await getAccessToken();
    if (!accessToken) return { error: UNAUTHORIZED_MESSAGE };

    const supabase = getSupabaseConfig();
    if (supabase.error || !supabase.url || !supabase.anonKey) {
      return { error: supabase.error ?? "Missing Supabase configuration." };
    }

    const rpcUrl = `${supabase.url}/rest/v1/rpc/get_tasks_count_per_project`;
    const headers = buildSupabaseHeaders(accessToken, supabase.anonKey);
    const candidates = buildPayloadCandidates(payload);
    let lastError = "Failed to load task counts per project.";
    let hasFunctionSignatureError = false;

    for (const candidate of candidates) {
      const response = await fetch(rpcUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(candidate),
        cache: "no-store",
      });

      const { data, parseError } = await parseJsonResponseBody(response);
      if (parseError) return { error: parseError };

      if (!response.ok) {
        const message = extractErrorMessage(data, "Failed to load task counts per project.");
        lastError = message;
        if (isFunctionSignatureError(message)) {
          hasFunctionSignatureError = true;
          continue;
        }
        return { error: message };
      }

      return {
        data: Array.isArray(data) ? (data as TasksPerProjectRow[]) : [],
      };
    }

    if (hasFunctionSignatureError) {
      return await fallbackFromTasksTable(supabase.url, headers, payload);
    }
    return { error: lastError };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : NETWORK_ERROR_MESSAGE,
    };
  }
}
