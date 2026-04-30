"use server";

import { authOptions } from "@/auth";
import {
  buildSupabaseHeaders,
  extractErrorMessage,
  getSupabaseConfig,
  NETWORK_ERROR_MESSAGE,
  parseJsonResponseBody,
} from "@/lib/actions/products/_utils/supabase-request";
import { CreateEpicValues } from "@/lib/schemes/products-shema/create-epic.shema";
import { getServerSession } from "next-auth";
import { revalidateTag } from "next/cache";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function toValidUuidOrNull(value?: string): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return UUID_REGEX.test(trimmed) ? trimmed : null;
}

function buildPayload(values: CreateEpicValues) {
  return {
    title: values.title.trim(),
    description: values.description?.trim() || null,
    assignee_id: toValidUuidOrNull(values.assignee_id),
    project_id: values.project_id,
    deadline: values.deadline?.trim() || null,
  };
}

// ─── Main Action ──────────────────────────────────────────────────────────────

export async function createEpic(values: CreateEpicValues) {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = session?.user?.access_token;

    if (!accessToken) {
      return { error: "Unauthorized. Please login again." };
    }

    const supabase = getSupabaseConfig();
    if (supabase.error) return { error: supabase.error };
    if (!supabase.url || !supabase.anonKey) return { error: "Missing Supabase configuration." };

    const res = await fetch(`${supabase.url}/rest/v1/epics`, {
      method: "POST",
      headers: buildSupabaseHeaders(accessToken, supabase.anonKey, {
        Prefer: "return=representation",
      }),
      body: JSON.stringify(buildPayload(values)),
    });

    const { data, parseError } = await parseJsonResponseBody(res);
    if (parseError) return { error: parseError };

    if (!res.ok) {
      return {
        error: extractErrorMessage(data, "Failed to create epic. Please try again."),
      };
    }

    revalidateTag("epics");
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : NETWORK_ERROR_MESSAGE,
    };
  }
}
