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
        <div className="gradient-bg relative min-h-screen">
            <div className="relative z-10 flex min-h-screen">
                {/* Left sidebar — desktop only */}
                <section className="hidden lg:flex fixed left-0 top-0 h-full w-1/2 flex-col justify-between glass-effect border-r border-white/10 px-12 py-14">
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

                {/* Right section — login form */}
                <section className="relative z-20 w-full lg:ml-[50%] lg:w-1/2 flex items-center justify-center px-4 py-10 sm:px-8">
                    <Card className="glass-effect w-full max-w-md rounded-2xl border border-white/10 p-6 shadow-2xl sm:p-8">
                        <div className="mb-8 space-y-2">
                            {/* Mobile logo */}
                            <div className="mb-6 flex items-center gap-2 lg:hidden">
                                <div className="rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 p-1.5">
                                    <LogIn className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-sm font-medium text-white/70">SPM Agent</span>
                            </div>
                            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Welcome back</h2>
                            <p className="text-sm text-white/50 sm:text-base">Sign in to continue to your workspace.</p>
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
                                    className="h-11 rounded-lg border-white/10 bg-white/5 text-white placeholder:text-white/30 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-glow"
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
                                        className="h-11 pr-12 rounded-lg border-white/10 bg-white/5 text-white placeholder:text-white/30 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-glow"
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
                                    className="text-sm font-medium text-amber-400/80 transition-colors duration-200 hover:text-amber-400"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                size="lg"
                                className="w-full rounded-xl font-semibold shadow-lg transition-all duration-300 bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600 hover:shadow-amber-500/20 hover:shadow-xl disabled:opacity-50"
                            >
                                {loading ? "Signing in..." : "Sign In"}
                            </Button>
                        </form>

                        <div className="my-6 relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-transparent px-3 text-white/30">New here?</span>
                            </div>
                        </div>

                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="w-full rounded-xl border border-white/10 bg-white/5 font-semibold text-white/80 transition-all duration-300 hover:border-white/20 hover:bg-white/10"
                        >
                            <Link href="/signup">Create Account</Link>
                        </Button>

                        <p className="mt-6 text-center text-xs text-white/30">
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