"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";

export default function ForgotPasswordPage() {
    const { forgotPassword, loading, error, clearError } = useAuth();

    const [email, setEmail] = useState("");
    const [success, setSuccess] = useState(false);

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        try {
            await forgotPassword(email);
            setSuccess(true);
        } catch {
            // Error is set by context
        }
    };

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
                                <Mail className="h-5 w-5 text-cyan-200" />
                            </div>
                            <span className="text-sm font-medium tracking-wide text-white/90">SPM Agent</span>
                        </div>
                    </div>

                    <div className="max-w-xl space-y-6">
                        <h1 className="text-5xl font-semibold leading-tight text-white">
                            Forgot your password? No worries.
                        </h1>
                        <p className="text-lg leading-relaxed text-slate-200/80">
                            We'll send you a secure link to reset your password. Just enter the email address associated with your account.
                        </p>
                    </div>

                    <p className="text-sm text-slate-300/70">© {new Date().getFullYear()} SPM Agent. All rights reserved.</p>
                </section>

                <section className="flex items-center justify-center px-4 py-10 sm:px-8">
                    <Card className="w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 sm:p-8">
                        {success ? (
                            <div className="text-center space-y-6">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
                                    <CheckCircle className="h-8 w-8 text-emerald-300" />
                                </div>

                                <div className="space-y-2">
                                    <h2 className="text-2xl font-semibold text-white">Check your email</h2>
                                    <p className="text-sm text-slate-200/80">
                                        If an account exists with{" "}
                                        <span className="font-semibold text-cyan-200">{email}</span>, we've
                                        sent a password reset link.
                                    </p>
                                </div>

                                <div className="rounded-lg border border-white/15 bg-white/5 p-4">
                                    <p className="text-sm text-slate-200/80">
                                        The reset link will expire in 24 hours. If you don't see the email,
                                        check your spam folder.
                                    </p>
                                </div>

                                <Button
                                    asChild
                                    size="lg"
                                    className="w-full rounded-xl font-semibold shadow-lg transition-all duration-300 hover:scale-[1.01]"
                                >
                                    <Link href="/login">
                                        <ArrowLeft className="h-4 w-4" />
                                        Back to Login
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="mb-8 space-y-2">
                                    <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Reset Password</h2>
                                    <p className="text-sm text-slate-200/80 sm:text-base">We'll send you a link to reset it.</p>
                                </div>

                                {error && (
                                    <Alert className="mb-6 border-red-300/40 bg-red-500/10 text-red-50">
                                        <AlertDescription className="font-medium text-red-100">{error}</AlertDescription>
                                    </Alert>
                                )}

                                <form onSubmit={handleForgotPassword} className="space-y-5">
                                    <div className="rounded-lg border border-white/15 bg-white/5 p-4">
                                        <p className="text-sm text-slate-200/80">
                                            Enter the email address associated with your account, and we'll send
                                            you a link to reset your password.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="font-medium text-slate-100">
                                            Email Address
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            placeholder="you@example.com"
                                            className="h-11 border-white/20 bg-white/5 text-white placeholder:text-slate-300/60 transition-all duration-300 focus-visible:ring-white/50"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        size="lg"
                                        className="w-full rounded-xl font-semibold shadow-lg transition-all duration-300 hover:scale-[1.01]"
                                    >
                                        {loading ? "Sending..." : "Send Reset Link"}
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
                                    <Link href="/login">
                                        <ArrowLeft className="h-4 w-4" />
                                        Back to Login
                                    </Link>
                                </Button>
                            </>
                        )}
                    </Card>
                </section>
            </div>
        </div>
    );
}
