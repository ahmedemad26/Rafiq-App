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
import { TASK_STATUSES, type TaskStatus } from "@/lib/constants/task-status";
import type {
  TasksCalendarStats,
  TasksCalendarStatsInput,
} from "@/lib/types/statistics";

type GetTasksCalendarStatsResult =
  | { data: TasksCalendarStats }
  | { error: string };

function buildPayloadCandidates(
  payload: TasksCalendarStatsInput,
): Array<Record<string, unknown>> {
  const prefixedRequired = {
    p_start_date: payload.p_start_date,
    p_end_date: payload.p_end_date,
  };
  const prefixedOptional =
    payload.p_project_id || payload.p_status
      ? {
          ...(payload.p_project_id
            ? { p_project_id: payload.p_project_id }
            : {}),
          ...(payload.p_status ? { p_status: payload.p_status } : {}),
        }
      : {};

  const plainRequired = {
    start_date: payload.p_start_date,
    end_date: payload.p_end_date,
  };
  const plainOptional =
    payload.p_project_id || payload.p_status
      ? {
          ...(payload.p_project_id ? { project_id: payload.p_project_id } : {}),
          ...(payload.p_status ? { status: payload.p_status } : {}),
        }
      : {};

  return [
    {
      ...prefixedRequired,
      p_project_id: payload.p_project_id,
      p_status: payload.p_status,
    },
    { ...prefixedRequired, ...prefixedOptional },
    {
      ...plainRequired,
      project_id: payload.p_project_id,
      status: payload.p_status,
    },
    { ...plainRequired, ...plainOptional },
  ];
}

function isFunctionSignatureError(message: string): boolean {
  return (
    message.includes("Could not find the function") ||
    message.includes("function public.get_tasks_calendar_stats")
  );
}

function toDateKey(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function toDateTime(value: string | null | undefined): Date | null {
  if (!value?.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function extractCountFromResponse(response: Response): number {
  const contentRange = response.headers.get("content-range") ?? "";
  const total = contentRange.split("/").at(-1);
  const parsed = Number.parseInt(total ?? "0", 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function fetchOverdueTasksCount(
  supabaseUrl: string,
  headers: Record<string, string>,
  payload: TasksCalendarStatsInput,
): Promise<number> {
  const nowIso = new Date().toISOString();
  const url = new URL(`${supabaseUrl}/rest/v1/tasks`);
  url.searchParams.set("select", "id");
  url.searchParams.set("due_date", `lt.${nowIso}`);
  url.searchParams.set("status", "neq.DONE");

  if (payload.p_project_id) {
    url.searchParams.set("project_id", `eq.${payload.p_project_id}`);
  }

  try {
    const response = await fetch(url.toString(), {
      method: "HEAD",
      headers: { ...headers, Prefer: "count=exact" },
      cache: "no-store",
    });

    console.log("[dashboard] overdue count query", {
      url: url.toString(),
      status: response.status,
      contentRange: response.headers.get("content-range"),
    });

    return response.ok ? extractCountFromResponse(response) : 0;
  } catch (error) {
    console.error("[dashboard] overdue count fetch error", error);
    return 0;
  }
}

function normalizeTaskStatus(value: unknown): TaskStatus {
  const normalized =
    typeof value === "string" ? value.trim().toUpperCase() : "";
  return (TASK_STATUSES as readonly string[]).includes(normalized)
    ? (normalized as TaskStatus)
    : "TO_DO";
}

function isDateInRange(
  dateKey: string,
  startDate: string,
  endDate: string,
): boolean {
  return dateKey >= startDate && dateKey <= endDate;
}

async function fallbackFromTasksTable(
  supabaseUrl: string,
  headers: Record<string, string>,
  payload: TasksCalendarStatsInput,
): Promise<GetTasksCalendarStatsResult> {
  const overdueTasks = await fetchOverdueTasksCount(
    supabaseUrl,
    headers,
    payload,
  );
  console.log("[dashboard] fallback overdueTasks", overdueTasks);

  const url = new URL(`${supabaseUrl}/rest/v1/tasks`);
  url.searchParams.set("select", "id,status,due_date,created_at,project_id");
  url.searchParams.set("order", "created_at.desc");
  url.searchParams.set("limit", "5000");
  if (payload.p_project_id) {
    url.searchParams.set("project_id", `eq.${payload.p_project_id}`);
  }
  if (payload.p_status) {
    url.searchParams.set("status", `eq.${payload.p_status}`);
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers,
    cache: "no-store",
  });
  const { data, parseError } = await parseJsonResponseBody(response);
  if (parseError) return { error: parseError };
  if (!response.ok) {
    return {
      error: extractErrorMessage(
        data,
        "Failed to load tasks calendar statistics.",
      ),
    };
  }

  const rows = Array.isArray(data)
    ? (data as Array<Record<string, unknown>>)
    : [];
  const dailyMap = new Map<string, Partial<Record<TaskStatus, number>>>();
  const totals: Partial<Record<TaskStatus, number>> = {};
  let totalTasks = 0;
  let doneTasks = 0;

  for (const row of rows) {
    const dueDate = toDateTime(
      typeof row.due_date === "string" ? row.due_date : null,
    );
    const dueDateKey = dueDate ? dueDate.toISOString().slice(0, 10) : null;
    const createdDateKey = toDateKey(
      typeof row.created_at === "string" ? row.created_at : null,
    );
    const dayKey = dueDateKey ?? createdDateKey;
    if (
      !dayKey ||
      !isDateInRange(dayKey, payload.p_start_date, payload.p_end_date)
    ) {
      continue;
    }

    const status = normalizeTaskStatus(row.status);

    totalTasks += 1;
    totals[status] = Number(totals[status] ?? 0) + 1;
    if (status === "DONE") doneTasks += 1;

    const currentDayStatuses = dailyMap.get(dayKey) ?? {};
    currentDayStatuses[status] = Number(currentDayStatuses[status] ?? 0) + 1;
    dailyMap.set(dayKey, currentDayStatuses);
  }

  const daily = Array.from(dailyMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, statuses]) => ({ day, statuses }));

  return {
    data: {
      daily,
      totals,
      total_tasks: totalTasks,
      done_tasks: doneTasks,
      overdue_tasks: overdueTasks,
    },
  };
}

export async function getTasksCalendarStats(
  payload: TasksCalendarStatsInput,
): Promise<GetTasksCalendarStatsResult> {
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

    const rpcUrl = `${supabase.url}/rest/v1/rpc/get_tasks_calendar_stats`;
    const headers = buildSupabaseHeaders(accessToken, supabase.anonKey);
    const candidates = buildPayloadCandidates(payload);
    let lastError = "Failed to load tasks calendar statistics.";
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
        const message = extractErrorMessage(
          data,
          "Failed to load tasks calendar statistics.",
        );
        lastError = message;
        if (isFunctionSignatureError(message)) {
          hasFunctionSignatureError = true;
          continue;
        }
        return { error: message };
      }

      const result = (data ?? {}) as Partial<TasksCalendarStats>;
      const exactOverdueTasks = await fetchOverdueTasksCount(
        supabase.url,
        headers,
        payload,
      );
      console.log("[dashboard] rpc overdueTasks", result.overdue_tasks);
      console.log("[dashboard] exact overdueTasks", exactOverdueTasks);
      return {
        data: {
          daily: Array.isArray(result.daily) ? result.daily : [],
          totals: result.totals ?? {},
          total_tasks: Number(result.total_tasks ?? 0),
          done_tasks: Number(result.done_tasks ?? 0),
          overdue_tasks: exactOverdueTasks,
        },
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
