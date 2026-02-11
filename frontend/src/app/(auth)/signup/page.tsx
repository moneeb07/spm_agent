"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

/*
 * ═══════════════════════════════════════════════
 * SIGNUP PAGE — Design this with Tailwind CSS
 * ═══════════════════════════════════════════════
 *
 * FIELDS:
 *   1. Full Name input   (type="text", required, maxLength=100)
 *   2. Email input        (type="email", required)
 *   3. Password input     (type="password", required, minLength=6)
 *   4. Confirm Password   (type="password", required) — client-side match check
 *
 * BUTTONS:
 *   1. "Create Account" button → calls handleSignup()
 *
 * LINKS:
 *   1. "Already have an account? Log in" → /login
 *
 * STATES TO DISPLAY:
 *   - error     → show error message (red text)
 *   - loading   → disable button, show spinner
 *
 * LAYOUT SUGGESTION:
 *   Centered card, similar to login page.
 *   Consider adding password requirements hint below password field.
 * ═══════════════════════════════════════════════
 */

export default function SignupPage() {
    const { signup, loading, error, clearError } = useAuth();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [localError, setLocalError] = useState<string | null>(null);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        setLocalError(null);

        // Client-side validation
        if (password !== confirmPassword) {
            setLocalError("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setLocalError("Password must be at least 6 characters.");
            return;
        }

        try {
            await signup({ email, password, full_name: fullName });
            // On success, AuthContext handles redirect
        } catch {
            // Error is already set in AuthContext
        }
    };

    const displayError = localError || error;

    // ─────────────────────────────────────────
    // YOUR TAILWIND DESIGN GOES BELOW
    // Use the state variables: fullName, email, password, confirmPassword,
    // displayError, loading, handleSignup
    // ─────────────────────────────────────────

    return (
        <div>
            {/* 
        DESIGN YOUR SIGNUP PAGE HERE 
        
        Use these variables:
        - fullName, setFullName
        - email, setEmail
        - password, setPassword
        - confirmPassword, setConfirmPassword
        - displayError (string | null)
        - loading (boolean)
        - handleSignup — attach to form onSubmit
      */}
            <form onSubmit={handleSignup}>
                {displayError && <p>{displayError}</p>}

                <div>
                    <label htmlFor="fullName">Full Name</label>
                    <input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        maxLength={100}
                        placeholder="John Doe"
                    />
                </div>

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
                        minLength={6}
                        placeholder="••••••••"
                    />
                </div>

                <div>
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Creating account..." : "Create Account"}
                </button>

                <div>
                    <span>Already have an account? </span>
                    <Link href="/login">Log in</Link>
                </div>
            </form>
        </div>
    );
}
