"use server";

import {
  buildSupabaseHeaders,
  extractErrorMessage,
  getAccessToken,
  NETWORK_ERROR_MESSAGE,
  parseJsonResponseBody,
  UNAUTHORIZED_MESSAGE,
} from "@/lib/actions/products/_utils/supabase-request";
import type { UpdateTaskStatusResult } from "@/lib/types/actions/products/tasks.type";

export async function updateTaskStatus(taskId: string, status: string): Promise<UpdateTaskStatusResult> {
  if (!taskId?.trim()) return { error: "Task id is required." };
  if (!status?.trim()) return { error: "Status is required." };

  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return { error: UNAUTHORIZED_MESSAGE };
    }

    const url = new URL(`${process.env.SUPABASE_URL}/rest/v1/tasks`);
    url.searchParams.set("id", `eq.${taskId}`);

    const res = await fetch(url.toString(), {
      method: "PATCH",
      headers: buildSupabaseHeaders(accessToken),
      body: JSON.stringify({ status }),
      cache: "no-store",
    });

    if (res.ok) {
      return { success: true };
    }

    const { data, parseError } = await parseJsonResponseBody(res);
    if (parseError) return { error: parseError };

    return {
      error: extractErrorMessage(data, "Failed to update task status"),
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : NETWORK_ERROR_MESSAGE,
    };
  }
}

