"use server";

import { authOptions } from "@/auth";
import { getSupabaseConfig } from "@/lib/actions/products/_utils/supabase-request";
import { ProjectDetails } from "@/lib/types/project";
import { getServerSession } from "next-auth";



export async function getProjectById(projectId: string) {
  if (!projectId) {
    return { error: "Project id is required." };
  }

  try {
    const session = await getServerSession(authOptions);
    const accessToken = session?.user?.access_token;

    if (!accessToken) {
      return { error: "Unauthorized. Please login again." };
    }

    const supabase = getSupabaseConfig();
    if (supabase.error) return { error: supabase.error };
    if (!supabase.url || !supabase.anonKey) return { error: "Missing Supabase configuration." };

    const url = new URL(`${supabase.url}/rest/v1/projects`);
    url.searchParams.set("id", `eq.${projectId}`);
    url.searchParams.set("select", "*");
    url.searchParams.set("limit", "1");

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        apikey: supabase.anonKey,
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    const rawBody = await res.text();
    let data: unknown = null;

    if (rawBody) {
      try {
        data = JSON.parse(rawBody);
      } catch {
        return {
          error: "Invalid server response. Please check the API endpoint.",
        };
      }
    }

    if (!res.ok) {
      const message =
        typeof data === "object" && data !== null && "message" in data
          ? String((data as { message: string }).message)
          : "Failed to load project details.";
      return { error: message };
    }

    const rows = Array.isArray(data) ? (data as Array<Record<string, unknown>>) : [];
    const row = rows[0];

    if (!row) {
      return { error: "Project not found." };
    }

    const project: ProjectDetails = {
      id: String(row.id ?? projectId),
      name: String(
        row.name ??
          row.project_name ??
          row.title ??
          row.project_title ??
          row.projectName ??
          "",
      ).trim(),
      description: String(row.description ?? row.details ?? "").trim(),
    };

    return { data: project };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Network error. Please try again.",
    };
  }
}
