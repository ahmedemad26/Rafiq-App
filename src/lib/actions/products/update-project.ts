'use server';

import { authOptions } from '@/auth';
import type { UpdateProjectParams } from '@/lib/types/actions/products/projects.type';
import { revalidateTag } from 'next/cache';
import { getServerSession } from 'next-auth';

// action to update an existing project
export async function updateProject({ projectId, values }: UpdateProjectParams) {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = session?.user?.access_token;

    // if no access token, return error
    if (!accessToken) {
      return { error: 'Unauthorized. Please login again.' };
    }

    // if no project id, return error
    if (!projectId) {
      return { error: 'Project id is required.' };
    }

    const url = new URL(`${process.env.SUPABASE_URL}/rest/v1/projects`);
    url.searchParams.set('id', `eq.${projectId}`);

    // fetch projects
    const res = await fetch(url.toString(), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        apikey: process.env.SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${accessToken}`,
        Prefer: 'return=representation',
      },
      body: JSON.stringify(values),
    });

    // parse response
    const rawBody = await res.text();
    let data: unknown = null;

    // if response is not ok, return error
    if (rawBody) {
      try {
        data = JSON.parse(rawBody);
      } catch {
        return {
          error: 'Invalid server response. Please check the API endpoint.',
        };
      }
    }

    // if response is not ok, return error
    if (!res.ok) {
      const message =
        typeof data === 'object' && data !== null && 'message' in data
          ? String((data as { message: string }).message)
          : 'Something went wrong.';
      return { error: message };
    }

    revalidateTag('projects');
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Network error. Please try again.',
    };
  }
}
