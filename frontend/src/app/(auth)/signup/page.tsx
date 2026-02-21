"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Eye, EyeOff, UserPlus, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";

export default function SignupPage() {
    const { signup, loading, error, clearError } = useAuth();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    // Password validation
    const isPasswordValid = password.length >= 6;
    const isPasswordMatch = password === confirmPassword && password.length > 0;

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
                                <UserPlus className="h-5 w-5 text-cyan-200" />
                            </div>
                            <span className="text-sm font-medium tracking-wide text-white/90">SPM Agent</span>
                        </div>
                    </div>

                    <div className="max-w-xl space-y-6">
                        <h1 className="text-5xl font-semibold leading-tight text-white">
                            Create your account and launch AI workflows in minutes.
                        </h1>
                        <p className="text-lg leading-relaxed text-slate-200/80">
                            Join your workspace, organize projects, and get structured plans with a modern control center built for fast product execution.
                        </p>
                    </div>

                    <p className="text-sm text-slate-300/70">© {new Date().getFullYear()} SPM Agent. All rights reserved.</p>
                </section>

                <section className="flex items-center justify-center px-4 py-10 sm:px-8">
                    <Card className="w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 sm:p-8">
                        <div className="mb-8 space-y-2">
                            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Create account</h2>
                            <p className="text-sm text-slate-200/80 sm:text-base">Join SPM Agent and start planning smarter.</p>
                        </div>

                        {displayError && (
                            <Alert className="mb-6 border-red-300/40 bg-red-500/10 text-red-50">
                                <AlertDescription className="font-medium text-red-100">{displayError}</AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleSignup} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="fullName" className="font-medium text-slate-100">
                                    Full Name
                                </Label>
                                <Input
                                    id="fullName"
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    maxLength={100}
                                    placeholder="John Doe"
                                    className="h-11 border-white/20 bg-white/5 text-white placeholder:text-slate-300/60 transition-all duration-300 focus-visible:ring-white/50"
                                />
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

                            <div className="space-y-2">
                                <Label htmlFor="password" className="font-medium text-slate-100">
                                    Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
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
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </Button>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <div
                                        className={`h-1.5 flex-1 rounded-full transition-colors ${isPasswordValid ? "bg-emerald-400" : "bg-slate-600"
                                            }`}
                                    />
                                    <span className="text-xs font-medium text-slate-300/80">
                                        Min 6 characters
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="font-medium text-slate-100">
                                    Confirm Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
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
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 rounded-md text-slate-300/70 hover:bg-white/10 hover:text-white"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </Button>
                                </div>
                                {password.length > 0 && (
                                    <div className="flex items-center gap-2 mt-2">
                                        {isPasswordMatch ? (
                                            <Check className="w-4 h-4 text-emerald-400" />
                                        ) : (
                                            <X className="w-4 h-4 text-rose-400" />
                                        )}
                                        <span
                                            className={`text-xs font-medium ${isPasswordMatch ? "text-emerald-300" : "text-rose-300"
                                                }`}
                                        >
                                            {isPasswordMatch ? "Passwords match" : "Passwords don't match"}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={loading || !isPasswordMatch}
                                size="lg"
                                className="mt-2 w-full rounded-xl font-semibold shadow-lg transition-all duration-300 hover:scale-[1.01]"
                            >
                                {loading ? "Creating account..." : "Create Account"}
                            </Button>
                        </form>

                        <div className="my-6 relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/20" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-transparent px-3 text-slate-200/70">Already have an account?</span>
                            </div>
                        </div>

                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="w-full rounded-xl border-white/30 bg-white/5 font-semibold text-white transition-all duration-300 hover:border-white/50 hover:bg-white/10 hover:text-white"
                        >
                            <Link href="/login">Sign In</Link>
                        </Button>

                        <p className="mt-6 text-center text-xs text-slate-200/70">
                            By creating an account, you agree to our{" "}
                            <Link href="#" className="underline underline-offset-2 transition-colors hover:text-white">
                                Terms of Service
                            </Link>
                        </p>
                    </Card>
                </section>
            </div>
        </div>
    );
}
