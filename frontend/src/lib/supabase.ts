import { createClient } from "@supabase/supabase-js";

// ──────────────────────────────────────────────
// Supabase Browser Client
// ──────────────────────────────────────────────
// This client uses the ANON key (public, safe for frontend).
// It is used for:
//   - Client-side auth state listening (onAuthStateChange)
//   - Password reset flow (receives the redirect)
//
// All API data calls go through our FastAPI backend via axios.
// ──────────────────────────────────────────────

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
