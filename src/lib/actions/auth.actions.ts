'use server';

import { RegisterValues } from '../schemes/register-schema';
import { AuthResponse, ApiResponse } from '../types/auth';

export async function registerAction(values: RegisterValues): Promise<ApiResponse<AuthResponse>> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/signup`,
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
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
    }
  );

  const payload: ApiResponse<AuthResponse> = await response.json();
  return payload;
}