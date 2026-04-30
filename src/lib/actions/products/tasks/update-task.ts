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
import { TASK_STATUSES } from "@/lib/constants/task-status";
import type { UpdateTaskPatch, UpdateTaskResult } from "@/lib/types/actions/products/tasks.type";
import { revalidateTag } from "next/cache";

function buildPatchBody(patch: UpdateTaskPatch): Record<string, unknown> | null {
  const body: Record<string, unknown> = {};

  if (patch.status !== undefined) {
    const normalized = patch.status.trim().toUpperCase();
    if (!(TASK_STATUSES as readonly string[]).includes(normalized)) {
      return null;
    }
    body.status = normalized;
  }

  if (patch.assignee_id !== undefined) {
    body.assignee_id = patch.assignee_id ?? null;
  }

  return Object.keys(body).length > 0 ? body : null;
}

export async function updateTask(
  taskId: string,
  patch: UpdateTaskPatch,
  taskPublicId?: string | null,
): Promise<UpdateTaskResult> {
  if (!taskId?.trim()) return { error: "Task id is required." };

  const body = buildPatchBody(patch);
  if (!body) return { error: "No valid fields to update." };

  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return { error: UNAUTHORIZED_MESSAGE };
    }

    const supabase = getSupabaseConfig();
    if (supabase.error) return { error: supabase.error };
    if (!supabase.url || !supabase.anonKey) return { error: "Missing Supabase configuration." };

    const updateOnce = async (column: "id" | "task_id", value: string) => {
      const url = new URL(`${supabase.url}/rest/v1/tasks`);
      url.searchParams.set(column, `eq.${value}`);
      url.searchParams.set("select", "id");

      const res = await fetch(url.toString(), {
        method: "PATCH",
        headers: buildSupabaseHeaders(accessToken, supabase.anonKey, {
          Prefer: "return=representation",
        }),
        body: JSON.stringify(body),
        cache: "no-store",
      });

      const { data, parseError } = await parseJsonResponseBody(res);
      if (parseError) return { error: parseError, updated: 0 };
      if (!res.ok) {
        return {
          error: extractErrorMessage(data, "Failed to update task"),
          updated: 0,
        };
      }

      const updated = Array.isArray(data) ? data.length : 0;
      return { updated, error: "" };
    };

    const byId = await updateOnce("id", taskId.trim());
    if (byId.error) return { error: byId.error };
    if (byId.updated > 0) {
      revalidateTag("tasks");
      return { success: true };
    }

    const publicId = taskPublicId?.trim();
    if (publicId) {
      const byTaskId = await updateOnce("task_id", publicId);
      if (byTaskId.error) return { error: byTaskId.error };
      if (byTaskId.updated > 0) {
        revalidateTag("tasks");
        return { success: true };
      }
    }

    return { error: "Task was not found for update." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : NETWORK_ERROR_MESSAGE,
    };
  }
}
