"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Eye, EyeOff, KeyRound, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";

function ResetPasswordForm() {
    const { resetPassword, loading, error, clearError } = useAuth();
    const router = useRouter();

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [success, setSuccess] = useState(false);
    const [tokenError, setTokenError] = useState<string | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);

    // Extract access_token from URL hash fragment (#access_token=xyz&type=recovery)
    // Supabase puts the token in the hash, not in query params
    useEffect(() => {
        const hash = window.location.hash.substring(1); // remove the leading #
        const params = new URLSearchParams(hash);
        const token = params.get("access_token");
        const refresh = params.get("refresh_token");

        if (token && refresh) {
            setAccessToken(token);
            setRefreshToken(refresh);
        } else {
            setTokenError("Missing reset token. Please request a new password reset link.");
        }
    }, []);
    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        if (newPassword.length < 6) {
            clearError();
            return;
        }

        if (newPassword !== confirmPassword) {
            clearError();
            return;
        }

        if (!accessToken || !refreshToken) return;

        try {
            await resetPassword(accessToken, refreshToken, newPassword);
            setSuccess(true);
            setTimeout(() => router.push("/login"), 3000);
        } catch {
            // Error is set by context
        }
    };

    const passwordMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
    const passwordTooShort = newPassword.length > 0 && newPassword.length < 6;

    // Token missing/invalid view
    if (tokenError) {
        return (
            <Card className="w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                <div className="text-center space-y-6">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/15">
                        <AlertTriangle className="h-8 w-8 text-amber-300" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-semibold text-white">Invalid Reset Link</h2>
                        <p className="text-sm text-slate-200/80">{tokenError}</p>
                    </div>
                    <Button
                        asChild
                        size="lg"
                        className="w-full rounded-xl font-semibold shadow-lg transition-all duration-300 hover:scale-[1.01]"
                    >
                        <Link href="/forgot-password">Request New Link</Link>
                    </Button>
                </div>
            </Card>
        );
    }

    // Success view
    if (success) {
        return (
            <Card className="w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                <div className="text-center space-y-6">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
                        <CheckCircle className="h-8 w-8 text-emerald-300" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-semibold text-white">Password Updated!</h2>
                        <p className="text-sm text-slate-200/80">
                            Your password has been reset successfully. Redirecting to login...
                        </p>
                    </div>
                    <Button
                        asChild
                        size="lg"
                        className="w-full rounded-xl font-semibold shadow-lg transition-all duration-300 hover:scale-[1.01]"
                    >
                        <Link href="/login">Go to Login</Link>
                    </Button>
                </div>
            </Card>
        );
    }

    // Main form
    return (
        <Card className="w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 sm:p-8">
            <div className="mb-8 space-y-2">
                <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Set New Password</h2>
                <p className="text-sm text-slate-200/80 sm:text-base">Enter your new password below.</p>
            </div>

            {error && (
                <Alert className="mb-6 border-red-300/40 bg-red-500/10 text-red-50">
                    <AlertDescription className="font-medium text-red-100">{error}</AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleReset} className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="new-password" className="font-medium text-slate-100">
                        New Password
                    </Label>
                    <div className="relative">
                        <Input
                            id="new-password"
                            type={showPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={6}
                            placeholder="••••••••"
                            className="h-11 pr-12 border-white/20 bg-white/5 text-white placeholder:text-slate-300/60 transition-all duration-300 focus-visible:ring-white/50"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 rounded-md text-slate-300/70 hover:bg-white/10 hover:text-white"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </Button>
                    </div>
                    {passwordTooShort && (
                        <p className="text-xs text-amber-300">Password must be at least 6 characters.</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="font-medium text-slate-100">
                        Confirm Password
                    </Label>
                    <div className="relative">
                        <Input
                            id="confirm-password"
                            type={showConfirm ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            className="h-11 pr-12 border-white/20 bg-white/5 text-white placeholder:text-slate-300/60 transition-all duration-300 focus-visible:ring-white/50"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 rounded-md text-slate-300/70 hover:bg-white/10 hover:text-white"
                        >
                            {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </Button>
                    </div>
                    {passwordMismatch && (
                        <p className="text-xs text-red-300">Passwords do not match.</p>
                    )}
                </div>

                <Button
                    type="submit"
                    disabled={loading || passwordMismatch || passwordTooShort}
                    size="lg"
                    className="w-full rounded-xl font-semibold shadow-lg transition-all duration-300 hover:scale-[1.01]"
                >
                    {loading ? "Resetting..." : "Reset Password"}
                </Button>
            </form>

            <div className="my-6 relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="bg-transparent px-3 text-slate-200/70">Remember your password?</span>
                </div>
            </div>

            <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full rounded-xl border-white/30 bg-white/5 font-semibold text-white transition-all duration-300 hover:border-white/50 hover:bg-white/10 hover:text-white"
            >
                <Link href="/login">Back to Login</Link>
            </Button>
        </Card>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
            <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-cyan-400/25 blur-3xl animate-pulse" />
            <div className="pointer-events-none absolute top-1/3 -right-24 h-[28rem] w-[28rem] rounded-full bg-indigo-500/25 blur-3xl animate-pulse" />
            <div className="pointer-events-none absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-violet-400/20 blur-3xl animate-pulse" />

            <div className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-2">
                <section className="hidden lg:flex flex-col justify-between border-r border-white/10 bg-white/[0.03] px-12 py-14 backdrop-blur-sm">
                    <div>
                        <div className="inline-flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-2 shadow-2xl">
                            <div className="rounded-lg bg-white/20 p-2">
                                <KeyRound className="h-5 w-5 text-cyan-200" />
                            </div>
                            <span className="text-sm font-medium tracking-wide text-white/90">SPM Agent</span>
                        </div>
                    </div>

                    <div className="max-w-xl space-y-6">
                        <h1 className="text-5xl font-semibold leading-tight text-white">
                            Almost there — set your new password.
                        </h1>
                        <p className="text-lg leading-relaxed text-slate-200/80">
                            Choose a strong password to keep your account secure. You'll be redirected to login once it's updated.
                        </p>
                    </div>

                    <p className="text-sm text-slate-300/70">© {new Date().getFullYear()} SPM Agent. All rights reserved.</p>
                </section>

                <section className="flex items-center justify-center px-4 py-10 sm:px-8">
                    <ResetPasswordForm />
                </section>
            </div>
        </div>
    );
}
