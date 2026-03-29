"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Eye, EyeOff, LogIn, Sparkles, Shield, Zap } from "lucide-react";
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
        } catch {
            // Error is already set in AuthContext
        }
    };

    return (
        <div
            className="relative min-h-screen overflow-hidden text-white"
            style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #111b33 40%, #0f172a 70%, #0c1322 100%)' }}
        >
            {/* Static ambient glow shapes — NO animation */}
            <div className="pointer-events-none absolute -top-32 -left-32 h-[30rem] w-[30rem] rounded-full bg-cyan-500/10 blur-[120px]" />
            <div className="pointer-events-none absolute top-1/3 -right-32 h-[34rem] w-[34rem] rounded-full bg-indigo-500/10 blur-[120px]" />
            <div className="pointer-events-none absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-violet-500/8 blur-[120px]" />

            <div className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-2">
                {/* Left panel — Brand & value proposition (desktop only) */}
                <section className="hidden lg:flex flex-col justify-between border-r border-white/10 bg-white/[0.03] px-12 py-14 backdrop-blur-sm">
                    <div>
                        <div className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2 hover-lift">
                            <div className="rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 p-2">
                                <LogIn className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-sm font-medium tracking-wide text-white/80">SPM Agent</span>
                        </div>
                    </div>

                    <div className="max-w-xl space-y-8">
                        <h1 className="text-5xl font-semibold leading-tight text-white">
                            Build, ship, and scale your AI workflows faster.
                        </h1>
                        <p className="text-lg leading-relaxed text-white/50">
                            Access your control center to manage projects, collaborate with your team, and automate your product operations with confidence.
                        </p>

                        {/* Feature highlights */}
                        <div className="space-y-4 pt-4">
                            <div className="flex items-center gap-3 text-white/40">
                                <Sparkles className="h-4 w-4 text-amber-400/70" />
                                <span className="text-sm">AI-powered project management</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/40">
                                <Shield className="h-4 w-4 text-amber-400/70" />
                                <span className="text-sm">Enterprise-grade security</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/40">
                                <Zap className="h-4 w-4 text-amber-400/70" />
                                <span className="text-sm">Real-time collaboration tools</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-white/30">© {new Date().getFullYear()} SPM Agent. All rights reserved.</p>
                </section>

                {/* Right panel — Login form */}
                <section className="flex items-center justify-center px-4 py-10 sm:px-8">
                    <Card className="w-full max-w-md rounded-2xl border border-white/15 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-xl sm:p-8 transition-all duration-300 hover:scale-[1.02] focus-within:scale-[1.02] hover:shadow-[0_32px_80px_rgba(0,0,0,0.3),0_16px_64px_rgba(255,255,255,0.05)]">
                        <div className="mb-8 space-y-2">
                            {/* Mobile logo */}
                            <div className="mb-6 flex items-center gap-2 lg:hidden">
                                <div className="rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 p-1.5">
                                    <LogIn className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-sm font-medium text-white/70">SPM Agent</span>
                            </div>
                            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Welcome back</h2>
                            <p className="text-sm text-slate-200/70 sm:text-base">Sign in to continue to your workspace.</p>
                        </div>

                        {error && (
                            <Alert className="mb-6 border-red-500/30 bg-red-500/10 backdrop-blur-md">
                                <AlertDescription className="font-medium text-red-400">{error}</AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="font-medium text-white/70">
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="you@example.com"
                                    className="h-12 rounded-xl border-white/20 bg-white/5 text-white placeholder:text-slate-400/60 transition-all duration-200 focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400/40 focus:bg-white/10"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="font-medium text-white/70">
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
                                        className="h-12 pr-12 rounded-xl border-white/20 bg-white/5 text-white placeholder:text-slate-400/60 transition-all duration-200 focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400/40 focus:bg-white/10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 rounded-md text-white/40 hover:bg-white/10 hover:text-white/70 transition-all"
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
                                    className="inline-block text-sm font-medium text-cyan-200/90 transition-all duration-200 hover:text-cyan-100 hover:-translate-y-0.5"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                size="lg"
                                className="w-full rounded-xl bg-amber-600 font-bold py-5 text-white shadow-lg transition-all duration-300 hover:bg-amber-500 hover:shadow-amber-600/25 hover:-translate-y-0.5 disabled:opacity-50"
                            >
                                {loading ? "Signing in..." : "Sign In"}
                            </Button>
                        </form>

                        <div className="my-6 relative">

                            <div className="relative flex justify-center text-sm">
                                <span className="bg-transparent px-3 text-slate-200/60">New user?</span>
                            </div>
                        </div>

                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="w-full rounded-xl border-white/20 bg-white/5 font-semibold text-white transition-all duration-300 hover:border-white/40 hover:bg-white/10 hover:text-white hover:-translate-y-0.5"
                        >
                            <Link href="/signup">Create Account</Link>
                        </Button>

                        <p className="mt-6 text-center text-xs text-slate-200/60">
                            By signing in, you agree to our{" "}
                            <Link href="#" className="underline underline-offset-2 text-amber-400/60 transition-colors hover:text-amber-400/80">
                                Terms of Service
                            </Link>
                        </p>
                    </Card>
                </section>
            </div>
        </div>
    );
}