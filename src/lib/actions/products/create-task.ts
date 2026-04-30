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
import {
  createTaskSchema,
  type CreateTaskValues,
} from "@/lib/schemes/products-shema/create-task.schema";
import { revalidateTag } from "next/cache";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function toValidUuidOrNull(value?: string): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return UUID_REGEX.test(trimmed) ? trimmed : null;
}

function buildPayload(values: CreateTaskValues) {
  const epicId = toValidUuidOrNull(values.epic_id);
  const assigneeId = toValidUuidOrNull(values.assignee_id);
  const due = values.due_date?.trim();
  const due_date = due ? due : null;

  return {
    project_id: values.project_id,
    title: values.title.trim(),
    description: values.description?.trim() || null,
    assignee_id: assigneeId,
    due_date,
    status: values.status,
    ...(epicId ? { epic_id: epicId } : {}),
  };
}

export async function createTask(values: CreateTaskValues) {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return { error: UNAUTHORIZED_MESSAGE };
    }

    const parsed = createTaskSchema.parse(values);
    const body = buildPayload(parsed);

    const supabase = getSupabaseConfig();
    if (supabase.error) return { error: supabase.error };
    if (!supabase.url || !supabase.anonKey) return { error: "Missing Supabase configuration." };

    const res = await fetch(`${supabase.url}/rest/v1/tasks`, {
      method: "POST",
      headers: buildSupabaseHeaders(accessToken, supabase.anonKey, {
        Prefer: "return=representation",
      }),
      body: JSON.stringify(body),
    });

    const { data, parseError } = await parseJsonResponseBody(res);
    if (parseError) return { error: parseError };

    if (!res.ok) {
      return {
        error: extractErrorMessage(data, "Failed to create task. Please try again."),
      };
    }

    revalidateTag("tasks");
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : NETWORK_ERROR_MESSAGE,
    };
  }
}
