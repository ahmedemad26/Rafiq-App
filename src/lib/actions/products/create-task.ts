"use server";

import { authOptions } from "@/auth";
import {
  createTaskSchema,
  type CreateTaskValues,
} from "@/lib/schemes/products-shema/create-task.schema";
import { getServerSession } from "next-auth";
import { revalidateTag } from "next/cache";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function toValidUuidOrNull(value?: string): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return UUID_REGEX.test(trimmed) ? trimmed : null;
}

function extractErrorMessage(data: unknown, fallback: string): string {
  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof (data as Record<string, unknown>).message === "string"
  ) {
    return (data as Record<string, string>).message;
  }
  return fallback;
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
    const session = await getServerSession(authOptions);
    const accessToken = session?.user?.access_token;

    if (!accessToken) {
      return { error: "Unauthorized. Please login again." };
    }

    const parsed = createTaskSchema.parse(values);
    const body = buildPayload(parsed);

    const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        apikey: process.env.SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${accessToken}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify(body),
    });

    const rawBody = await res.text();
    let data: unknown = null;

    if (rawBody) {
      try {
        data = JSON.parse(rawBody);
      } catch {
        return { error: "Invalid server response. Please check the API endpoint." };
      }
    }

    if (!res.ok) {
      return {
        error: extractErrorMessage(data, "Failed to create task. Please try again."),
      };
    }

    revalidateTag("tasks");
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Network error. Please try again.",
    };
  }
}
