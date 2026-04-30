"use server";

import { authOptions } from "@/auth";
import { GetProjectEpicsParams, GetProjectEpicsSuccess, ProjectEpic } from "@/lib/types/epics";
import { getServerSession } from "next-auth";

export type GetProjectEpicsResult = { error: string } | GetProjectEpicsSuccess;

export async function getProjectEpics(
  params: GetProjectEpicsParams,
): Promise<GetProjectEpicsResult> {
  const { projectId, limit, offset, searchTerm } = params;

  if (!projectId) return { error: "Project id is required." };
  if (limit < 1 || limit > 100) return { error: "Invalid limit." };
  if (offset < 0) return { error: "Invalid offset." };

  try {
    const session = await getServerSession(authOptions);
    const accessToken = session?.user?.access_token;

    if (!accessToken) {
      return { error: "Unauthorized. Please login again." };
    }

    const url = new URL(`${process.env.SUPABASE_URL}/rest/v1/project_epics`);
    url.searchParams.set("project_id", `eq.${projectId}`);
    if (searchTerm?.trim()) {
      url.searchParams.set("title", `ilike.%${searchTerm.trim()}%`);
    }
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("offset", String(offset));
    url.searchParams.set("order", "created_at.desc");

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        apikey: process.env.SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${accessToken}`,
        Prefer: "count=exact",
      },
      cache: "no-store",
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
      const message =
        data &&
        typeof data === "object" &&
        "message" in data &&
        typeof (data as { message: unknown }).message === "string"
          ? (data as { message: string }).message
          : "Failed to search epics";
      return { error: message };
    }

    const epics = (Array.isArray(data) ? data : []) as ProjectEpic[];
    const contentRange = res.headers.get("content-range");
    const totalStr = contentRange?.split("/")?.[1] ?? "0";
    const totalCount = Number.parseInt(totalStr, 10);
    const rangePart = contentRange?.split("/")?.[0] ?? "";
    const [startRaw, endRaw] = rangePart.split("-");
    const start = Number.parseInt(startRaw ?? "", 10);
    const end = Number.parseInt(endRaw ?? "", 10);
    const range =
      Number.isFinite(start) && Number.isFinite(end)
        ? {
            start,
            end,
          }
        : null;

    return {
      data: epics,
      totalCount: Number.isFinite(totalCount) ? totalCount : 0,
      range,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Network error. Please try again.",
    };
  }
}
