"use server";

import { authOptions } from "@/auth";
import {
  GetProjectsPageParams,
  GetProjectsPageResult,
  ParsedRange,
  ProjectRow,
} from "@/lib/types/project";
import { getServerSession } from "next-auth";





function parseContentRange(
  header: string | null,
  rowCount: number,
  offset: number,
): ParsedRange | null {
  if (!header) return null;

  const trimmed = header.trim();
  const slash = trimmed.lastIndexOf("/");
  if (slash === -1) return null;

  const totalStr = trimmed.slice(slash + 1).trim();
  if (totalStr === "*") return null;

  const totalCount = Number.parseInt(totalStr, 10);
  if (Number.isNaN(totalCount)) return null;

  if (totalCount === 0) return { start: 0, end: -1, totalCount: 0 };

  const rangePart = trimmed.slice(0, slash).trim();
  const fallbackStart = offset;
  const fallbackEnd = offset + Math.max(rowCount - 1, 0);

  if (rangePart === "*") {
    return { start: fallbackStart, end: fallbackEnd, totalCount };
  }

  const dash = rangePart.indexOf("-");
  if (dash === -1) {
    return { start: fallbackStart, end: fallbackEnd, totalCount };
  }

  const start = Number.parseInt(rangePart.slice(0, dash), 10);
  const end = Number.parseInt(rangePart.slice(dash + 1), 10);

  if (Number.isNaN(start) || Number.isNaN(end)) {
    return { start: fallbackStart, end: fallbackEnd, totalCount };
  }

  return { start, end, totalCount };
}

function buildRange(
  parsed: ParsedRange | null,
  rowCount: number,
  offset: number,
): { start: number; end: number } | null {
  if (parsed) {
    return rowCount > 0 ? { start: parsed.start, end: parsed.end } : null;
  }
  return rowCount > 0 ? { start: offset, end: offset + rowCount - 1 } : null;
}

function extractErrorMessage(
  data: unknown,
  fallback: string,
): string {
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

function buildSupabaseUrl(limit: number, offset: number): string {
  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    throw new Error("Missing Supabase URL configuration.");
  }

  const url = new URL(
    `${supabaseUrl}/rest/v1/rpc/get_projects`,
  );
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(offset));
  return url.toString();
}

// ─── Main Action ──────────────────────────────────────────────────────────────

export async function getProjectsPage(
  params: GetProjectsPageParams,
): Promise<GetProjectsPageResult> {
  const { limit, offset } = params;

  if (limit < 1 || limit > 100) return { error: "Invalid limit." };
  if (offset < 0) return { error: "Invalid offset." };

  try {
    const session = await getServerSession(authOptions);
    const accessToken = session?.user?.access_token;

    if (!accessToken) {
      return { error: "Unauthorized. Please login again." };
    }

    const supabaseAnonKey =
      process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseAnonKey) {
      return { error: "Missing Supabase anon key configuration." };
    }

    const res = await fetch(buildSupabaseUrl(limit, offset), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        apikey: supabaseAnonKey,
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
      if (res.status === 401) {
        return { error: "Unauthorized. Please login again." };
      }

      return {
        error: extractErrorMessage(data, `Request failed with status ${res.status}.`),
      };
    }

    const rows = (data ?? []) as ProjectRow[];
    const parsed = parseContentRange(res.headers.get("content-range"), rows.length, offset);

    return {
      data: rows,
      totalCount: parsed?.totalCount ?? rows.length,
      range: buildRange(parsed, rows.length, offset),
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Network error. Please try again.",
    };
  }
}