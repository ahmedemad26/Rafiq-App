'use server';

import { authOptions } from '@/auth';
import { getServerSession } from 'next-auth';

type Project = {
  id: string;
  name: string;
  description: string;
  created_at: string | null;
};

// action to get projects
export async function getProjects() {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = session?.user?.access_token;

    // if no access token, return error
    if (!accessToken) {
      return { error: 'Unauthorized. Please login again.' };
    }

    // fetch projects
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/get_projects`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

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

    // return projects
    return { data: (data ?? []) as Project[] };
  } catch (error) {
    // if error, return error
    return {
      error: error instanceof Error ? error.message : 'Network error. Please try again.',
    };
  }
}
