"use client";

import { useState } from "react";
import api from "@/lib/axios";
import Link from "next/link";

/*
 * ═══════════════════════════════════════════════
 * FORGOT PASSWORD PAGE — Design this with Tailwind CSS
 * ═══════════════════════════════════════════════
 *
 * FIELDS:
 *   1. Email input (type="email", required)
 *
 * BUTTONS:
 *   1. "Send Reset Link" button → calls handleForgotPassword()
 *
 * LINKS:
 *   1. "Back to login" → /login
 *
 * STATES TO DISPLAY:
 *   - error     → show error message (red text)
 *   - success   → show success message (green text, e.g. "Check your email")
 *   - loading   → disable button, show spinner
 *
 * LAYOUT SUGGESTION:
 *   Centered card, similar to login but simpler.
 *   After success, show a confirmation message and hide the form.
 * ═══════════════════════════════════════════════
 */

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await api.post("/api/auth/forgot-password", { email });
            setSuccess(true);
        } catch (err: any) {
            setError(
                err.response?.data?.detail ||
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // ─────────────────────────────────────────
    // YOUR TAILWIND DESIGN GOES BELOW
    // Use: email, setEmail, loading, error, success, handleForgotPassword
    // ─────────────────────────────────────────

    return (
        <div>
            {/* 
        DESIGN YOUR FORGOT PASSWORD PAGE HERE 
        
        Use these variables:
        - email, setEmail
        - error (string | null)
        - success (boolean) — if true, show "Check your email" message
        - loading (boolean)
        - handleForgotPassword — attach to form onSubmit
      */}
            {success ? (
                <div>
                    <h2>Check your email</h2>
                    <p>
                        If an account exists with {email}, we&apos;ve sent a password
                        reset link.
                    </p>
                    <Link href="/login">Back to login</Link>
                </div>
            ) : (
                <form onSubmit={handleForgotPassword}>
                    {error && <p>{error}</p>}

                    <h2>Forgot Password</h2>
                    <p>Enter your email to receive a password reset link.</p>

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

                    <button type="submit" disabled={loading}>
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>

                    <div>
                        <Link href="/login">Back to login</Link>
                    </div>
                </form>
            )}
        </div>
    );
}
