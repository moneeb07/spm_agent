"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

/*
 * ═══════════════════════════════════════════════
 * LOGIN PAGE — Design this with Tailwind CSS
 * ═══════════════════════════════════════════════
 *
 * FIELDS:
 *   1. Email input      (type="email", required)
 *   2. Password input   (type="password", required)
 *
 * BUTTONS:
 *   1. "Log In" button   → calls handleLogin()
 *
 * LINKS:
 *   1. "Don't have an account? Sign up" → /signup
 *   2. "Forgot password?"              → /forgot-password
 *
 * STATES TO DISPLAY:
 *   - error     → show error message (e.g. red text above form)
 *   - loading   → disable button, show spinner
 *   - message   → show success message (e.g. from URL query ?message=...)
 *
 * LAYOUT SUGGESTION:
 *   Centered card on the page with the app logo/name at top.
 * ═══════════════════════════════════════════════
 */

export default function LoginPage() {
    const { login, loading, error, clearError } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        try {
            await login({ email, password });
            // On success, AuthContext redirects to /dashboard
        } catch {
            // Error is already set in AuthContext
        }
    };

    // ─────────────────────────────────────────
    // YOUR TAILWIND DESIGN GOES BELOW
    // Use the state variables: email, setEmail, password, setPassword,
    // error, loading, handleLogin
    // ─────────────────────────────────────────

    return (
        <div>
            {/* 
        DESIGN YOUR LOGIN PAGE HERE 
        
        Use these variables:
        - email, setEmail
        - password, setPassword
        - error (string | null) — display if not null
        - loading (boolean) — disable button / show spinner
        - handleLogin — attach to form onSubmit
      */}
            <form onSubmit={handleLogin}>
                {error && <p>{error}</p>}

                <div>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="you@example.com"
                    />
                </div>

                <div>
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Signing in..." : "Log In"}
                </button>

                <div>
                    <Link href="/forgot-password">Forgot password?</Link>
                </div>
                <div>
                    <span>Don&apos;t have an account? </span>
                    <Link href="/signup">Sign up</Link>
                </div>
            </form>
        </div>
    );
}
