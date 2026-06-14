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
import type { GetProjectTaskDetailsResult } from "@/lib/types/actions/products/tasks.type";
import type { ProjectTask } from "@/lib/types/project-tasks";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function pickString(source: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string") {
      const normalized = value.trim();
      if (normalized) return normalized;
    }
  }
  return null;
}

function mapTaskRecord(
  primaryRow: Record<string, unknown> | null,
  fallbackRow: Record<string, unknown> | null,
): ProjectTask | null {
  const row = primaryRow ?? fallbackRow;
  if (!row) return null;
  const assigneeObj = asRecord(primaryRow?.assignee) ?? asRecord(primaryRow?.user) ?? asRecord(primaryRow?.member);

  return {
    // tasks.id is required for updates; prefer base table row id when available.
    id: String(fallbackRow?.id ?? row.id ?? ""),
    project_id:
      pickString(primaryRow ?? {}, ["project_id"]) ?? pickString(fallbackRow ?? {}, ["project_id"]),
    task_id: pickString(primaryRow ?? {}, ["task_id"]) ?? pickString(fallbackRow ?? {}, ["task_id"]),
    title: pickString(primaryRow ?? {}, ["title"]) ?? pickString(fallbackRow ?? {}, ["title"]),
    description:
      pickString(primaryRow ?? {}, ["description"]) ?? pickString(fallbackRow ?? {}, ["description"]),
    due_date: pickString(primaryRow ?? {}, ["due_date"]) ?? pickString(fallbackRow ?? {}, ["due_date"]),
    created_at:
      pickString(primaryRow ?? {}, ["created_at"]) ?? pickString(fallbackRow ?? {}, ["created_at"]),
    // assignee id from base tasks table is authoritative for writes
    assignee_id:
      pickString(fallbackRow ?? {}, ["assignee_id", "assignee_user_id", "assigned_to", "user_id"]) ??
      pickString(primaryRow ?? {}, [
        "assignee_id",
        "assignee_user_id",
        "assigned_to",
        "assigned_to_id",
        "assigned_user_id",
        "assignee",
        "user_id",
      ]) ??
      (assigneeObj ? pickString(assigneeObj, ["id", "user_id", "sub"]) : null),
    assignee_name:
      pickString(primaryRow ?? {}, [
        "assignee_name",
        "assignee_full_name",
        "assigned_to_name",
        "assignee_display_name",
        "assigned_user_name",
      ]) ??
      (assigneeObj ? pickString(assigneeObj, ["name", "full_name", "display_name"]) : null) ??
      pickString(fallbackRow ?? {}, ["assignee_name", "assignee_full_name", "assigned_to_name"]),
    assignee_email:
      pickString(primaryRow ?? {}, [
        "assignee_email",
        "assignee_mail",
        "assigned_to_email",
        "assignee_user_email",
      ]) ??
      (assigneeObj ? pickString(assigneeObj, ["email"]) : null) ??
      pickString(fallbackRow ?? {}, ["assignee_email", "assignee_mail", "assigned_to_email"]),
    assignee_avatar:
      pickString(primaryRow ?? {}, [
        "assignee_avatar",
        "assignee_avatar_url",
        "assignee_image",
        "assigned_to_avatar",
      ]) ??
      (assigneeObj ? pickString(assigneeObj, ["avatar_url", "avatar", "image"]) : null) ??
      pickString(fallbackRow ?? {}, ["assignee_avatar", "assignee_avatar_url", "assignee_image"]),
    reporter_name:
      pickString(primaryRow ?? {}, ["reporter_name", "creator_name", "created_by_name"]) ??
      pickString(fallbackRow ?? {}, ["reporter_name", "creator_name", "created_by_name"]),
    reporter_avatar:
      pickString(primaryRow ?? {}, ["reporter_avatar", "creator_avatar", "created_by_avatar"]) ??
      pickString(fallbackRow ?? {}, ["reporter_avatar", "creator_avatar", "created_by_avatar"]),
    epic_id: pickString(primaryRow ?? {}, ["epic_id"]) ?? pickString(fallbackRow ?? {}, ["epic_id"]),
    priority: pickString(primaryRow ?? {}, ["priority"]) ?? pickString(fallbackRow ?? {}, ["priority"]),
    status:
      (pickString(primaryRow ?? {}, ["status"]) ??
        pickString(fallbackRow ?? {}, ["status"])) as ProjectTask["status"],
  };
}
export async function getProjectTaskDetails(
  projectId: string,
  taskId: string,
): Promise<GetProjectTaskDetailsResult> {
  if (!projectId?.trim()) return { error: "Project id is required." };
  if (!taskId?.trim()) return { error: "Task id is required." };

  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return { error: UNAUTHORIZED_MESSAGE };
    }

    const supabase = getSupabaseConfig();
    if (supabase.error) return { error: supabase.error };
    if (!supabase.url || !supabase.anonKey) return { error: "Missing Supabase configuration." };

    const headers = buildSupabaseHeaders(accessToken, supabase.anonKey);

    const tasksUrl = new URL(`${supabase.url}/rest/v1/tasks`);
    tasksUrl.searchParams.set("project_id", `eq.${projectId}`);
    tasksUrl.searchParams.set("id", `eq.${taskId}`);
    tasksUrl.searchParams.set(
      "select",
      "id,project_id,task_id,title,description,due_date,created_at,assignee_id,status,epic_id",
    );
    tasksUrl.searchParams.set("limit", "1");

    const tasksRes = await fetch(tasksUrl.toString(), { method: "GET", headers, cache: "no-store" });
    const { data: tasksData, parseError: tasksParseError } = await parseJsonResponseBody(tasksRes);
    if (tasksParseError) return { error: tasksParseError };
    if (!tasksRes.ok) {
      return {
        error: extractErrorMessage(tasksData, "Failed to load task details. Please try again."),
      };
    }

    const tasksRow = Array.isArray(tasksData) ? asRecord(tasksData[0]) : null;
    const task = mapTaskRecord(tasksRow, tasksRow);
    return { data: task };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : NETWORK_ERROR_MESSAGE,
    };
  }
}

