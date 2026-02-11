from fastapi import APIRouter, Depends, status
from app.schemas.auth import (
    SignUpRequest,
    LoginRequest,
    RefreshTokenRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    UpdateProfileRequest,
    AuthResponse,
    UserProfile,
    MessageResponse,
)
from app.services.auth_service import AuthService
from app.dependencies import get_current_user
 
router = APIRouter(prefix="/api/auth", tags=["Authentication"])


# ── Public Endpoints (no auth required) ──────────────


@router.post(
    "/signup",
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
async def signup(data: SignUpRequest):
    """
    Create a new user account.

    - Registers the user in Supabase Auth
    - Auto-creates a profile row via DB trigger
    - Returns tokens if email confirmation is disabled,
      otherwise returns a confirmation message
    """
    return AuthService.sign_up(data)


@router.post(
    "/login",
    summary="Login with email and password",
)
async def login(data: LoginRequest):
    """
    Authenticate with email + password.

    Returns access_token, refresh_token, and basic user info.
    """
    return AuthService.sign_in(data)


@router.post(
    "/refresh",
    summary="Refresh access token",
)
async def refresh_token(data: RefreshTokenRequest):
    """
    Exchange a refresh token for a new access + refresh token pair.
    """
    return AuthService.refresh_token(data)


@router.post(
    "/forgot-password",
    response_model=MessageResponse,
    summary="Request password reset email",
)
async def forgot_password(data: ForgotPasswordRequest):
    """
    Send a password reset email to the provided address.
    Always returns success to avoid revealing whether the email exists.
    """
    return AuthService.forgot_password(data)


@router.post(
    "/reset-password",
    response_model=MessageResponse,
    summary="Reset password with token",
)
async def reset_password(data: ResetPasswordRequest):
    """
    Reset the user's password using the token from the reset email.
    """
    return AuthService.reset_password(data)


# ── Protected Endpoints (auth required) ─────────────


@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="Logout current user",
)
async def logout(user: dict = Depends(get_current_user)):
    """
    Logout the current user.
    Frontend should also discard stored tokens.
    """
    return AuthService.sign_out(user["sub"])


@router.get(
    "/me",
    response_model=UserProfile,
    summary="Get current user profile",
)
async def get_me(user: dict = Depends(get_current_user)):
    """
    Fetch the authenticated user's profile data.
    """
    return AuthService.get_profile(user["sub"], user["email"])


@router.put(
    "/me",
    summary="Update current user profile",
)
async def update_me(
    data: UpdateProfileRequest,
    user: dict = Depends(get_current_user),
):
    """
    Update profile fields for the authenticated user.
    Only non-null fields in the request body will be updated.
    """
    return AuthService.update_profile(user["sub"], data)
