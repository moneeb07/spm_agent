// ──────────────────────────────────────────────
// Auth TypeScript Types
// ──────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  full_name?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  access_token: string;
  new_password: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  skill_level: "junior" | "medium" | "senior" | null;
  available_hours_per_day: number | null;
  preferred_pace: "relaxed" | "medium" | "aggressive" | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface UpdateProfileRequest {
  full_name?: string;
  skill_level?: "junior" | "medium" | "senior";
  available_hours_per_day?: number;
  preferred_pace?: "relaxed" | "medium" | "aggressive";
}

export interface MessageResponse {
  message: string;
  success: boolean;
}

export interface ApiError {
  detail: string;
}
