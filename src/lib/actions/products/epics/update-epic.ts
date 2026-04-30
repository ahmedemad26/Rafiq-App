"use server";

import { authOptions } from "@/auth";
import type {
  UpdateEpicPatch,
  UpdateEpicResult,
} from "@/lib/types/actions/products/epics.type";
import { getServerSession } from "next-auth";
import { revalidateTag } from "next/cache";

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

function buildPatchBody(patch: UpdateEpicPatch): Record<string, unknown> | null {
  const body: Record<string, unknown> = {};

  if (patch.title !== undefined) {
    const trimmed = patch.title.trim();
    if (!trimmed) return null; // title is required — reject empty string
    body.title = trimmed;
  }

  if (patch.description !== undefined) {
    const trimmed = patch.description?.trim() ?? "";
    body.description = trimmed === "" ? null : trimmed;
  }

  if (patch.assignee_id !== undefined) {
    body.assignee_id = patch.assignee_id ?? null;
  }

  if (patch.deadline !== undefined) {
    const trimmed = patch.deadline?.trim() ?? "";
    body.deadline = trimmed === "" ? null : trimmed;
  }

  return Object.keys(body).length > 0 ? body : null;
}

export async function updateEpic(
  epicId: string,
  patch: UpdateEpicPatch
): Promise<UpdateEpicResult> {
  if (!epicId?.trim()) {
    return { error: "Epic ID is required." };
  }

  const body = buildPatchBody(patch);

  if (body === null) {
    // Distinguish between "title was empty" and "nothing to update"
    if (patch.title !== undefined && !patch.title.trim()) {
      return { error: "Title cannot be empty." };
    }
    return { error: "No fields to update." };
  }

  try {
    const session = await getServerSession(authOptions);
    const accessToken = session?.user?.access_token;

    if (!accessToken) {
      return { error: "Unauthorized. Please log in again." };
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      return { error: "Server configuration error. Please contact support." };
    }

    const url = new URL(`${supabaseUrl}/rest/v1/epics`);
    url.searchParams.set("id", `eq.${epicId}`);

    const res = await fetch(url.toString(), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
        // return=representation gives us back the row (useful for errors too)
        // Use return=minimal only if you never need the updated row
        Prefer: "return=minimal",
      },
      body: JSON.stringify(body),
    });

    // Supabase PATCH with return=minimal responds 204 No Content on success.
    // Only attempt to parse if there's actually a body (i.e. on error).
    if (res.ok) {
      revalidateTag("epics");
      return { data: true };
    }

    // Error path — try to extract Supabase's error message
    const rawBody = await res.text().catch(() => "");
    let data: unknown = null;

    if (rawBody) {
      try {
        data = JSON.parse(rawBody);
      } catch {
        // rawBody isn't JSON — use it as-is if it's short enough
        const fallbackMsg =
          rawBody.length < 200 ? rawBody : "Failed to update epic. Please try again.";
        return { error: fallbackMsg };
      }
    }

    return {
      error: extractErrorMessage(data, "Failed to update epic. Please try again."),
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Network error. Please try again.",
    };
  }
}
