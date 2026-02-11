from supabase import create_client, Client
from app.config import get_settings

settings = get_settings()

# Supabase client using SERVICE ROLE key (full admin access).
# This is used server-side only — never expose this key to the frontend.
supabase: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_SERVICE_ROLE_KEY
)
