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
import { CreateProjectValues } from '@/lib/schemes/products-shema/add-project.shema';
import { revalidateTag } from 'next/cache';

// action to create a new project
export async function createProject(values: CreateProjectValues) {
  try {
    const accessToken = await getAccessToken();

    // if no access token, return error
    if (!accessToken) {
      return { error: UNAUTHORIZED_MESSAGE };
    }

    const supabase = getSupabaseConfig();
    if (supabase.error) {
      return { error: supabase.error };
    }
    if (!supabase.url || !supabase.anonKey) {
      return { error: 'Missing Supabase configuration.' };
    }

    // fetch projects
    const res = await fetch(
      `${supabase.url}/rest/v1/projects`,
      {
        method: 'POST',
        headers: buildSupabaseHeaders(accessToken, supabase.anonKey, {
          Prefer: 'return=representation',
        }),
        body: JSON.stringify(values),
      }
    );

    const { data, parseError } = await parseJsonResponseBody(res);
    if (parseError) return { error: parseError };

    // if response is not ok, return error
    if (!res.ok) {
      return { error: extractErrorMessage(data, 'Failed to create project. Please try again.') };
    }

    revalidateTag('projects');
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : NETWORK_ERROR_MESSAGE,
    };
  }
}