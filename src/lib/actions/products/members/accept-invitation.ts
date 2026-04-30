"use server";

import { authOptions } from "@/auth";
import type { AcceptInvitationResult } from "@/lib/types/actions/products/members.type";
import { getServerSession } from "next-auth";

function extractErrorMessage(data: unknown, fallback: string): string {
  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof (data as Record<string, unknown>).message === "string"
  ) {
    return String((data as Record<string, unknown>).message);
  }
  return fallback;
}

function extractProjectId(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  const value = record.project_id ?? record.projectId ?? record.p_project_id;
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function acceptInvitation(token: string): Promise<AcceptInvitationResult> {
  const normalizedToken = token?.trim();
  if (!normalizedToken) return { error: "Invitation token is required." };

  try {
    const session = await getServerSession(authOptions);
    const accessToken = session?.user?.access_token;
    if (!accessToken) {
      return { error: "Unauthorized. Please login again.", status: 401 };
    }

    const baseUrl = process.env.SUPABASE_URL;
    if (!baseUrl) {
      return { error: "Missing API base URL configuration." };
    }

    const url = `${baseUrl}/rest/v1/rpc/accept_invitation`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ p_token: normalizedToken }),
      cache: "no-store",
    });

    const rawBody = await res.text();
    let data: unknown = null;
    if (rawBody) {
      try {
        data = JSON.parse(rawBody);
      } catch {
        return { error: "Invalid server response. Please check the API endpoint.", status: res.status };
      }
    }

    if (!res.ok) {
      return {
        error: extractErrorMessage(data, "Failed to accept invitation"),
        status: res.status,
      };
    }

    return {
      success: true,
      projectId: extractProjectId(data),
      message: "Invitation accepted successfully",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Network error. Please try again.",
    };
  }
}

