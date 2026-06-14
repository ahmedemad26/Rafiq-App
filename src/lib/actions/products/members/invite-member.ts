"use server";

import { authOptions } from "@/auth";
import { getSupabaseConfig } from "@/lib/actions/products/_utils/supabase-request";
import type { InviteMemberResult } from "@/lib/types/actions/products/members.type";
import { getServerSession } from "next-auth";

function looksLikeInvitationToken(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{32,}$/i.test(value.trim());
}

function extractErrorMessage(data: unknown, fallback: string, status?: number): string {
  const rec = typeof data === "object" && data !== null ? (data as Record<string, unknown>) : null;
  const message =
    (typeof rec?.message === "string" && rec.message) ||
    (typeof rec?.error === "string" && rec.error) ||
    fallback;
  const normalized = String(message).trim();
  const lower = normalized.toLowerCase();
  const code = typeof rec?.code === "string" ? rec.code.trim().toUpperCase() : "";

  if (lower.includes("already a project member")) {
    return "This user is already a member of this project.";
  }
  if (lower.includes("invitation already exists")) {
    return "An invitation has already been sent to this email for this project.";
  }
  if (lower.includes("only project members can invite")) {
    return "Only project members can send invitations.";
  }
  if (code === "P0001") {
    return normalized || "Unable to send invitation. Please check project permissions.";
  }
  if (status === 401) {
    return "Unauthorized. Please login again.";
  }

  return normalized || fallback;
}

async function sendInviteEmailDirect(params: {
  baseUrl: string;
  accessToken: string;
  apikey: string;
  email: string;
  inviteLink: string;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const { baseUrl, accessToken, apikey, email, inviteLink } = params;
  const res = await fetch(`${baseUrl}/functions/v1/send-invite-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey,
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      email,
      invite_link: inviteLink,
    }),
    cache: "no-store",
  });

  if (res.ok) return { ok: true };

  const raw = await res.text();
  return {
    ok: false,
    reason: raw || `Edge function failed with status=${res.status}`,
  };
}

export async function inviteMember(params: {
  email: string;
  projectId: string;
  appUrl: string;
}): Promise<InviteMemberResult> {
  const normalizedEmail = params.email?.trim().toLowerCase();
  const projectId = params.projectId?.trim();
  const appUrl = params.appUrl?.trim();

  if (!normalizedEmail) return { error: "Email is required." };
  if (!projectId) return { error: "Project id is required." };
  if (!appUrl) return { error: "App URL is required." };

  try {
    const session = await getServerSession(authOptions);
    const accessToken = session?.user?.access_token;

    if (!accessToken) {
      return { error: "Unauthorized. Please login again.", status: 401 };
    }
    const supabase = getSupabaseConfig();
    if (supabase.error) return { error: supabase.error };
    if (!supabase.url || !supabase.anonKey) return { error: "Missing Supabase configuration." };

    const url = `${supabase.url}/rest/v1/rpc/invite_member`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabase.anonKey,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        p_email: normalizedEmail,
        p_project_id: projectId,
        p_app_url: appUrl,
        p_base_url: supabase.url,
      }),
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
        error: extractErrorMessage(data, "Failed to send invitation", res.status),
        status: res.status,
      };
    }

    if (data === false) {
      return {
        error: "Failed to send invitation",
        status: res.status,
      };
    }

    if (
      data &&
      typeof data === "object" &&
      "error" in data &&
      typeof (data as Record<string, unknown>).error === "string"
    ) {
      return {
        error: extractErrorMessage(data, "Failed to send invitation", res.status),
        status: res.status,
      };
    }

    const rpcToken =
      looksLikeInvitationToken(data) ? data : data && looksLikeInvitationToken((data as Record<string, unknown>).token) ? String((data as Record<string, unknown>).token) : null;

    if (!rpcToken) {
      return {
        success: true,
        message: "Invitation created successfully.",
      };
    }
    const inviteUrl = new URL("/invite", appUrl);
    inviteUrl.searchParams.set("token", rpcToken);

    const emailResult = await sendInviteEmailDirect({
      baseUrl: supabase.url,
      accessToken,
      apikey: supabase.anonKey,
      email: normalizedEmail,
      inviteLink: inviteUrl.toString(),
    });

    if (!emailResult.ok) {
      return {
        success: true,
        message: "Invitation created, but email delivery could not be confirmed.",
      };
    }

    const successMessage =
      data &&
      typeof data === "object" &&
      "message" in data &&
      typeof (data as Record<string, unknown>).message === "string"
        ? String((data as Record<string, unknown>).message)
        : "Invitation sent successfully";

    return {
      success: true,
      message: successMessage,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Network error. Please try again.",
    };
  }
}

