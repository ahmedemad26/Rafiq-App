'use server';

import {
  buildSupabaseHeaders,
  extractErrorMessage,
  getAccessToken,
  getSupabaseConfig,
  NETWORK_ERROR_MESSAGE,
  parseJsonResponseBody,
  UNAUTHORIZED_MESSAGE,
} from '@/lib/actions/products/_utils/supabase-request';
import type { UpdateProjectParams } from '@/lib/types/actions/products/projects.type';
import { revalidateTag } from 'next/cache';

// action to update an existing project
export async function updateProject({ projectId, values }: UpdateProjectParams) {
  try {
    const accessToken = await getAccessToken();

    // if no access token, return error
    if (!accessToken) {
      return { error: UNAUTHORIZED_MESSAGE };
    }

    // if no project id, return error
    if (!projectId) {
      return { error: 'Project id is required.' };
    }

    const supabase = getSupabaseConfig();
    if (supabase.error) {
      return { error: supabase.error };
    }
    if (!supabase.url || !supabase.anonKey) {
      return { error: 'Missing Supabase configuration.' };
    }

    const url = new URL(`${supabase.url}/rest/v1/projects`);
    url.searchParams.set('id', `eq.${projectId}`);

    // fetch projects
    const res = await fetch(url.toString(), {
      method: 'PATCH',
      headers: buildSupabaseHeaders(accessToken, supabase.anonKey, {
        Prefer: 'return=representation',
      }),
      body: JSON.stringify(values),
    });

    const { data, parseError } = await parseJsonResponseBody(res);
    if (parseError) return { error: parseError };

    // if response is not ok, return error
    if (!res.ok) {
      return { error: extractErrorMessage(data, 'Failed to update project. Please try again.') };
    }

    revalidateTag('projects');
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : NETWORK_ERROR_MESSAGE,
    };
  }
}
