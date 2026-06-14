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

function normalizeStatus(status?: string): string | null {
  if (status === undefined) return null;
  const normalized = status.trim().toUpperCase();
  if (!(TASK_STATUSES as readonly string[]).includes(normalized)) {
    return null;
  }
  return normalized;
}

function buildPatchBodies(patch: UpdateTaskPatch): Array<Record<string, unknown>> {
  const normalizedStatus = normalizeStatus(patch.status);
  if (patch.status !== undefined && !normalizedStatus) return [];

  const shared: Record<string, unknown> = {};
  if (patch.status !== undefined) {
    shared.status = normalizedStatus;
  }

  if (patch.assignee_id !== undefined) {
    return [{ ...shared, assignee_id: patch.assignee_id ?? null }];
  }

  return Object.keys(shared).length > 0 ? [shared] : [];
}

export async function updateTask(
  taskId: string,
  patch: UpdateTaskPatch,
  taskPublicId?: string | null,
): Promise<UpdateTaskResult> {
  if (!taskId?.trim()) return { error: "Task id is required." };

  const bodies = buildPatchBodies(patch);
  if (!bodies.length) return { error: "No valid fields to update." };

  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return { error: UNAUTHORIZED_MESSAGE };
    }

    const supabase = getSupabaseConfig();
    if (supabase.error) return { error: supabase.error };
    if (!supabase.url || !supabase.anonKey) return { error: "Missing Supabase configuration." };

    const expectedAssignee =
      patch.assignee_id === undefined ? undefined : (patch.assignee_id?.trim() || null);

    const updateOnce = async (column: "id" | "task_id", value: string, body: Record<string, unknown>) => {
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

      console.log("UPDATE ONCE", {
        status: res.status,
        bodySent: body,
        responseData: data,
      });

      if (parseError) return { error: parseError, updated: 0 };

      if (!res.ok) {
        return {
          error: extractErrorMessage(data, "Failed to update task"),
          updated: 0,
        };
      }

      const updated = Array.isArray(data) ? data.length : 0;

      console.log("UPDATED COUNT", updated);

      return { updated, error: "" };
    };

    const verifyAssigneeOnce = async (column: "id" | "task_id", value: string) => {
      if (expectedAssignee === undefined) return { ok: true, error: "" };

      const url = new URL(`${supabase.url}/rest/v1/tasks`);
      url.searchParams.set(column, `eq.${value}`);
      url.searchParams.set("select", "assignee_id");
      url.searchParams.set("limit", "1");

      const res = await fetch(url.toString(), {
        method: "GET",
        headers: buildSupabaseHeaders(accessToken, supabase.anonKey),
        cache: "no-store",
      });

      const { data, parseError } = await parseJsonResponseBody(res);
      if (parseError) return { ok: false, error: parseError };
      if (!res.ok) {
        return {
          ok: false,
          error: extractErrorMessage(data, "Failed to verify assignee update."),
        };
      }

      const row = Array.isArray(data) ? (data[0] as { assignee_id?: string | null } | undefined) : undefined;
      const actualAssignee = row?.assignee_id?.trim() || null;
      const ok = actualAssignee === expectedAssignee;

      console.log("VERIFY ASSIGNEE", {
        expectedAssignee,
        actualAssignee,
        ok,
      });

      return {
        ok,
        error: ok ? "" : "Assignee was not updated in database.",
      };
    };

    const publicId = taskPublicId?.trim();
    let lastError = "";

    for (const body of bodies) {
      const byId = await updateOnce("id", taskId.trim(), body);
      if (byId.updated > 0) {
        const verified = await verifyAssigneeOnce("id", taskId.trim());
        if (!verified.ok) return { error: verified.error };
        revalidateTag("tasks");
        return { success: true };
      }

      if (byId.error) {
        const isUnknownColumn = /column .* does not exist/i.test(byId.error);
        if (!isUnknownColumn) return { error: byId.error };
        lastError = byId.error;
      }

      if (publicId) {
        const byTaskId = await updateOnce("task_id", publicId, body);
        if (byTaskId.updated > 0) {
          const verified = await verifyAssigneeOnce("task_id", publicId);
          if (!verified.ok) return { error: verified.error };
          revalidateTag("tasks");
          return { success: true };
        }
        if (byTaskId.error) {
          const isUnknownColumn = /column .* does not exist/i.test(byTaskId.error);
          if (!isUnknownColumn) return { error: byTaskId.error };
          lastError = byTaskId.error;
        }
      }
    }

    if (lastError) return { error: lastError };
    return { error: "Task was not found for update." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : NETWORK_ERROR_MESSAGE,
    };
  }
}
