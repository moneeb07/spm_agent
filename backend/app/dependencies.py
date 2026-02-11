from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
import httpx
from app.config import get_settings
# HTTPBearer → reads Authorization: Bearer <token> header automatically
# HTTPAuthorizationCredentials → object contains the token
# jose.jwt → library to decode and verify JWTs
# This extracts the token from the "Authorization: Bearer <token>" header
security = HTTPBearer()



"""
This parameter uses FastAPI's dependency injection.

- `Depends(security)` tells FastAPI to run the `security` callable
  (HTTPBearer) before this function is called.
- HTTPBearer reads the "Authorization: Bearer <token>" header
  and returns an HTTPAuthorizationCredentials object.
- FastAPI automatically passes that object as the `credentials` argument
  to this function.
- This way, we can directly access the token without manually parsing headers.
"""

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    Dependency that extracts and validates the JWT from the Authorization header.

    Returns a dict with user info:
        {"sub": "<user_id>", "email": "<email>", ...}

    Usage in a route:
        @router.get("/me")
        async def me(user: dict = Depends(get_current_user)):
            ...
    """
    token = credentials.credentials
    settings = get_settings()
    #credentials is an object like:
    #HTTPAuthorizationCredentials(scheme="Bearer", credentials="eyJhbGciOiJIUzI1NiIsInR...")
    # .credentials → "eyJhbGciOiJIUzI1NiIsInR..." actual string
    try:
        # Fetch the JWKS (JSON Web Key Set) from Supabase
        # This contains the Public Keys used to verify the token signature
        jwks_url = f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json"
        
        # Verify the token against the JWKS
        # This automatically handles key rotation and algorithm selection (ES256/RS256)
        payload = jwt.decode(
            token,
            key=httpx.get(jwks_url).json(),  # In production, cache this!
            algorithms=["HS256", "RS256", "ES256"],
            audience="authenticated",
        )

        user_id: str = payload.get("sub")
        email: str = payload.get("email")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user ID.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return {
            "sub": user_id,
            "email": email,
            "role": payload.get("role", "authenticated"),
        }

    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token validation failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
