"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
    const { login, loading, error, clearError } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

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
                                <LogIn className="h-5 w-5 text-cyan-200" />
                            </div>
                            <span className="text-sm font-medium tracking-wide text-white/90">SPM Agent</span>
                        </div>
                    </div>

                    <div className="max-w-xl space-y-6">
                        <h1 className="text-5xl font-semibold leading-tight text-white">
                            Build, ship, and scale your AI workflows faster.
                        </h1>
                        <p className="text-lg leading-relaxed text-slate-200/80">
                            Access your control center to manage projects, collaborate with your team, and automate your product operations with confidence.
                        </p>
                    </div>

                    <p className="text-sm text-slate-300/70">© {new Date().getFullYear()} SPM Agent. All rights reserved.</p>
                </section>

                <section className="flex items-center justify-center px-4 py-10 sm:px-8">
                    <Card className="w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 sm:p-8">
                        <div className="mb-8 space-y-2">
                            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Welcome back</h2>
                            <p className="text-sm text-slate-200/80 sm:text-base">Sign in to continue to your workspace.</p>
                        </div>

                        {error && (
                            <Alert className="mb-6 border-red-300/40 bg-red-500/10 text-red-50">
                                <AlertDescription className="font-medium text-red-100">{error}</AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleLogin} className="space-y-5">
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
                            </div>

                            <div className="flex justify-end">
                                <Link
                                    href="/forgot-password"
                                    className="text-sm font-medium text-cyan-200/90 transition-colors duration-200 hover:text-cyan-100"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                size="lg"
                                className="w-full rounded-xl font-semibold shadow-lg transition-all duration-300 hover:scale-[1.01]"
                            >
                                {loading ? "Signing in..." : "Sign In"}
                            </Button>
                        </form>

                        <div className="my-6 relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/20" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-transparent px-3 text-slate-200/70">New user?</span>
                            </div>
                        </div>

                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="w-full rounded-xl border-white/30 bg-white/5 font-semibold text-white transition-all duration-300 hover:border-white/50 hover:bg-white/10 hover:text-white"
                        >
                            <Link href="/signup">Create Account</Link>
                        </Button>

                        <p className="mt-6 text-center text-xs text-slate-200/70">
                            By signing in, you agree to our{" "}
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
