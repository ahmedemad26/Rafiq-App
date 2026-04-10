"use server";

import { ForgotPasswordValues } from "../schemes/forgot.shema";
import { AuthResponse, ApiResponse } from "../types/auth";

export async function ForgotPasswordAction(
  values: ForgotPasswordValues,
): Promise<ApiResponse<AuthResponse>> {
  const redirectTo = process.env.NEXT_PUBLIC_PASSWORD_RESET_REDIRECT_URL!;
  
  const recoverUrl = new URL(
    `https://senppmtyjdhsnucxosmd.supabase.co/auth/v1/recover`,
  );
  recoverUrl.searchParams.set("redirect_to", redirectTo);

  const response = await fetch(
    recoverUrl.toString(),
    {
      method: "POST",
      body: JSON.stringify({
        ...values,
      }),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
      },
    },
  );

  const payload: ApiResponse<AuthResponse> = await response.json();
  return payload;
}
