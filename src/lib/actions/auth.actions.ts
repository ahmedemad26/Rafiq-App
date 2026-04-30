'use server';

import { RegisterValues } from '../schemes/register-schema';
import { AuthResponse, ApiResponse } from '../types/auth';

export async function registerAction(values: RegisterValues): Promise<ApiResponse<AuthResponse>> {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      error: {
        code: 500,
        message: 'Missing Supabase configuration.',
      },
    };
  }

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: 'POST',
      body: JSON.stringify({
        email: values.email,
        password: values.password,
        data: {
          name: values.name,
          department: values.department,
        },
      }),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        apikey: supabaseAnonKey,
      },
      cache: 'no-store',
    });

    const rawBody = await response.text().catch(() => '');
    const payload: unknown = rawBody ? JSON.parse(rawBody) : {};
    const normalizedPayload = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};

    if (!response.ok) {
      return {
        error: {
          code: response.status,
          message:
            (typeof normalizedPayload.msg === 'string' && normalizedPayload.msg) ||
            (typeof normalizedPayload.message === 'string' && normalizedPayload.message) ||
            'Failed to create account.',
          errorCode:
            typeof normalizedPayload.error_code === 'string' ? normalizedPayload.error_code : undefined,
        },
      };
    }

    return { data: normalizedPayload as unknown as AuthResponse };
  } catch (error) {
    return {
      error: {
        code: 500,
        message: error instanceof Error ? error.message : 'Network error. Please try again.',
      },
    };
  }
}