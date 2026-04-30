'use server';

import { RegisterValues } from '../schemes/register-schema';
import { AuthResponse, ApiResponse } from '../types/auth';

export async function registerAction(values: RegisterValues): Promise<ApiResponse<AuthResponse>> {
  const response = await fetch(
    `${process.env.SUPABASE_URL}/auth/v1/signup`,
    {
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
        apikey: process.env.SUPABASE_ANON_KEY!,
      },
    }
  );

  const payload = await response.json();

  if (!response.ok) {
    return {
      error: {
        code: payload.error_code,
        message: payload.msg,
      },
    };
  }

  return payload as ApiResponse<AuthResponse>;
}