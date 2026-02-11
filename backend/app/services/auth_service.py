from fastapi import HTTPException, status
from gotrue.errors import AuthApiError
from app.supabase_client import supabase
from app.schemas.auth import (
    SignUpRequest,
    LoginRequest,
    RefreshTokenRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    UpdateProfileRequest,
)


class AuthService:
    """
    Handles all auth business logic by calling Supabase Auth + DB.
    Each method either returns data or raises an HTTPException.
    """
 
    # ── Sign Up ──────────────────────────────────────────
    @staticmethod
    def sign_up(data: SignUpRequest) -> dict:
        """Register a new user. Profile row is auto-created by DB trigger."""
        try:
            response = supabase.auth.sign_up(
                {
                    "email": data.email,
                    "password": data.password,
                    "options": {
                        "data": {
                            "full_name": data.full_name,
                        }
                    },
                }
            )

            if response.user is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Sign up failed. The email may already be registered.",
                )

            # If email confirmation is enabled, session may be None
            session = response.session
            if session is None:
                return {
                    "message": "Sign up successful. Please check your email to confirm your account.",
                    "user": {
                        "id": str(response.user.id),
                        "email": response.user.email,
                    },
                }

            return {
                "access_token": session.access_token,
                "refresh_token": session.refresh_token,
                "token_type": "bearer",
                "expires_in": session.expires_in,
                "user": {
                    "id": str(response.user.id),
                    "email": response.user.email,
                    "full_name": data.full_name,
                },
            }

        except AuthApiError as e:
            print(e)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e),
            )

    # ── Sign In ──────────────────────────────────────────
    @staticmethod
    def sign_in(data: LoginRequest) -> dict:
        """Authenticate user with email + password, return tokens."""
        try:
            response = supabase.auth.sign_in_with_password(
                {
                    "email": data.email,
                    "password": data.password,
                }
            )

            session = response.session
            if session is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid credentials.",
                )

            return {
                "access_token": session.access_token,
                "refresh_token": session.refresh_token,
                "token_type": "bearer",
                "expires_in": session.expires_in,
                "user": {
                    "id": str(response.user.id),
                    "email": response.user.email,
                },
            }

        except AuthApiError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=str(e),
            )

    # ── Sign Out ─────────────────────────────────────────
    @staticmethod
    def sign_out(user_id: str) -> dict:
        """
        Sign out user. Since we use JWT (stateless), the frontend
        should also discard the token. This endpoint lets the backend
        do any cleanup if needed in the future.
        """
        # Supabase Admin API: revoke all sessions for a user
        # For now, we simply return success — the frontend removes the token.
        return {"message": "Logged out successfully.", "success": True}

    # ── Refresh Token ────────────────────────────────────
    @staticmethod
    def refresh_token(data: RefreshTokenRequest) -> dict:
        """Exchange a refresh token for a new access token."""
        try:
            response = supabase.auth.refresh_session(data.refresh_token)

            session = response.session
            if session is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired refresh token.",
                )

            return {
                "access_token": session.access_token,
                "refresh_token": session.refresh_token,
                "token_type": "bearer",
                "expires_in": session.expires_in,
                "user": {
                    "id": str(response.user.id),
                    "email": response.user.email,
                },
            }

        except AuthApiError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=str(e),
            )

    # ── Forgot Password ─────────────────────────────────
    @staticmethod
    def forgot_password(data: ForgotPasswordRequest) -> dict:
        """Send a password reset email via Supabase."""
        try:
            supabase.auth.reset_password_email(data.email)
            return {
                "message": "If an account exists with that email, a reset link has been sent.",
                "success": True,
            }
        except AuthApiError as e:
            # Don't reveal whether the email exists
            return {
                "message": "If an account exists with that email, a reset link has been sent.",
                "success": True,
            }

    # ── Reset Password ───────────────────────────────────
    @staticmethod
    def reset_password(data: ResetPasswordRequest) -> dict:
        """Reset password using the token from the reset email."""
        try:
            # First set the session using the access token from the reset link
            supabase.auth.set_session(data.access_token, "")
            # Then update the password
            supabase.auth.update_user({"password": data.new_password})
            return {"message": "Password updated successfully.", "success": True}
        except AuthApiError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e),
            )

    # ── Get Profile ──────────────────────────────────────
    @staticmethod
    def get_profile(user_id: str, email: str) -> dict:
        """Fetch user profile from the profiles table."""
        try:
            response = (
                supabase.table("profiles")
                .select("*")
                .eq("id", user_id)
                .single()
                .execute()
            )

            profile = response.data
            if profile is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Profile not found.",
                )

            return {
                "id": profile["id"],
                "email": email,
                "full_name": profile.get("full_name"),
                "skill_level": profile.get("skill_level"),
                "available_hours_per_day": profile.get("available_hours_per_day"),
                "preferred_pace": profile.get("preferred_pace"),
                "created_at": profile.get("created_at"),
                "updated_at": profile.get("updated_at"),
            }

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch profile: {str(e)}",
            )

    # ── Update Profile ───────────────────────────────────
    @staticmethod
    def update_profile(user_id: str, data: UpdateProfileRequest) -> dict:
        """Update user profile fields (only non-None fields are updated)."""
        try:
            update_data = data.model_dump(exclude_none=True) #model_dump convert pydantic model to dict
            if not update_data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No fields provided to update.",
                )

            response = (
                supabase.table("profiles")
                .update(update_data)
                .eq("id", user_id)
                .execute()
            )

            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Profile not found.",
                )

            return {
                "message": "Profile updated successfully.",
                "success": True,
                "profile": response.data[0],
            }

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update profile: {str(e)}",
            )
