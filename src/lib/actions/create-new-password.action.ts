"use server";

import { CreateNewPasswordValues } from "../schemes/create-new-password.shema";
import { AuthResponse, ApiResponse } from "../types/auth";

// action to create a new password
export async function CreateNewPasswordAction(
    values: CreateNewPasswordValues,
    accessToken: string,
): Promise<ApiResponse<AuthResponse>> {
    // if no access token, return error
    if (!accessToken) {
        throw new Error("Missing access token");
    }

    // fetch user
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`,
        {
            method: "PUT",
            body: JSON.stringify({
                ...values,
            }),
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                Authorization: `Bearer ${accessToken}`,
            },
        },
    );

    // parse response
    const payload: ApiResponse<AuthResponse> = await response.json();
    return payload;
}
