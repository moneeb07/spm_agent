from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


# ──────────────────────────────────────────────
# Request Models
# ──────────────────────────────────────────────

class SignUpRequest(BaseModel):
    """Request body for user registration."""
    email: EmailStr
    password: str = Field(..., min_length=6, description="Minimum 6 characters")
    full_name: str = Field(..., min_length=1, max_length=100)


class LoginRequest(BaseModel):
    """Request body for user login."""
    email: EmailStr
    password: str


class RefreshTokenRequest(BaseModel):
    """Request body to refresh an access token."""
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    """Request body for forgot password (sends reset email via Supabase)."""
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Request body to reset password with a new one."""
    access_token: str
    new_password: str = Field(..., min_length=6)
 

class UpdateProfileRequest(BaseModel):
    """Request body to update user profile fields."""
    full_name: Optional[str] = Field(None, max_length=100)
    skill_level: Optional[str] = Field(None, pattern="^(junior|medium|senior)$")
    available_hours_per_day: Optional[float] = Field(None, ge=0.5, le=24)
    preferred_pace: Optional[str] = Field(None, pattern="^(relaxed|medium|aggressive)$")


# ──────────────────────────────────────────────
# Response Models
# ──────────────────────────────────────────────

class AuthResponse(BaseModel):
    """Response returned after successful signup or login."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: dict


class UserProfile(BaseModel):
    """User profile data returned from /me endpoint."""
    id: str
    email: str
    full_name: Optional[str] = None
    skill_level: Optional[str] = None
    available_hours_per_day: Optional[float] = None
    preferred_pace: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class MessageResponse(BaseModel):
    """Generic message response."""
    message: str
    success: bool = True
