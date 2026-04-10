export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
  user: {
    id: string;
    email: string;
    user_metadata: {
      name: string;
      department: string;
      email_verified: boolean;
    };
    app_metadata: {
      provider: string;
    };
    created_at: string;
  };
}

export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: number;
    message: string;
  };
}
