"use server";

import { authOptions } from "@/auth";
import type { InviteMemberResult } from "@/lib/types/actions/products/members.type";
import { getServerSession } from "next-auth";

type InvitationTokenRow = { token?: string };
function looksLikeInvitationToken(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{32,}$/i.test(value.trim());
}

function extractErrorMessage(data: unknown, fallback: string, status?: number): string {
  const rec = typeof data === "object" && data !== null ? (data as Record<string, unknown>) : null;
  const message =
    (typeof rec?.message === "string" && rec.message) ||
    (typeof rec?.error === "string" && rec.error) ||
    fallback;
  const code = typeof rec?.code === "string" ? rec.code : "";
  const details = typeof rec?.details === "string" ? rec.details : "";
  const hint = typeof rec?.hint === "string" ? rec.hint : "";

  const chunks = [message];
  if (status) chunks.push(`status=${status}`);
  if (code) chunks.push(`code=${code}`);
  if (details) chunks.push(`details=${details}`);
  if (hint) chunks.push(`hint=${hint}`);
  return chunks.join(" | ");
}

async function getLatestInvitationToken(params: {
  baseUrl: string;
  accessToken: string;
  apikey: string;
  projectId: string;
  email: string;
  inviterId: string;
}): Promise<string | null> {
  const { baseUrl, accessToken, apikey, projectId, email, inviterId } = params;
  const query = new URLSearchParams({
    select: "token",
    project_id: `eq.${projectId}`,
    email: `eq.${email}`,
    invited_by: `eq.${inviterId}`,
    order: "created_at.desc",
    limit: "1",
  });

  const res = await fetch(`${baseUrl}/rest/v1/project_invitations?${query.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      apikey,
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!res.ok) return null;
  const rows = (await res.json()) as InvitationTokenRow[];
  const token = rows?.[0]?.token;
  return typeof token === "string" && token.trim().length > 0 ? token : null;
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
  const email = params.email?.trim();
  const projectId = params.projectId?.trim();
  const appUrl = params.appUrl?.trim();

  if (!email) return { error: "Email is required." };
  if (!projectId) return { error: "Project id is required." };
  if (!appUrl) return { error: "App URL is required." };

  try {
    const session = await getServerSession(authOptions);
    const accessToken = session?.user?.access_token;
    const inviterId = session?.user?.id;
    const apikey = process.env.SUPABASE_ANON_KEY;

    if (!accessToken) {
      return { error: "Unauthorized. Please login again.", status: 401 };
    }
    if (!inviterId) {
      return { error: "Missing user session. Please login again.", status: 401 };
    }

    const baseUrl = process.env.SUPABASE_URL;
    if (!baseUrl) {
      return { error: "Missing API base URL configuration." };
    }
    if (!apikey) {
      return { error: "Missing API key configuration." };
    }

    const url = `${baseUrl}/rest/v1/rpc/invite_member`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        p_email: email,
        p_project_id: projectId,
        p_app_url: appUrl,
        p_base_url: baseUrl,
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

    const latestToken =
      rpcToken ??
      (await getLatestInvitationToken({
        baseUrl,
        accessToken,
        apikey,
        projectId,
        email,
        inviterId,
      }));

    if (!latestToken) {
      return {
        success: true,
        message:
          "Invitation created, but email sending could not be verified automatically. Please check invitation logs.",
      };
    }

    const emailResult = await sendInviteEmailDirect({
      baseUrl,
      accessToken,
      apikey,
      email,
      inviteLink: `${appUrl}/invite?token=${latestToken}`,
    });

    if (!emailResult.ok) {
      return {
        success: true,
        message: `Invitation created, but email may not have been sent. ${emailResult.reason}`,
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

