"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Eye, EyeOff, UserPlus, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4 py-8">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

            {/* Main Card */}
            <div className="relative z-10 w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-8 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="bg-white rounded-xl p-3">
                                <UserPlus className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                        <p className="text-blue-100">Join us and get started</p>
                    </div>

                    {/* Form Content */}
                    <div className="px-6 py-8">
                        {/* Error Alert */}
                        {displayError && (
                            <Alert className="mb-6 border-red-200 bg-red-50">
                                <AlertDescription className="text-red-800 font-medium">
                                    {displayError}
                                </AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleSignup} className="space-y-4">
                            {/* Full Name Field */}
                            <div className="space-y-2">
                                <Label htmlFor="fullName" className="text-gray-700 font-semibold">
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
                                    className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-800"
                                />
                            </div>

                            {/* Email Field */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-700 font-semibold">
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="you@example.com"
                                    className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-800"
                                />
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-gray-700 font-semibold">
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
                                        className="h-11 pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-800"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                {/* Password Strength Indicator */}
                                <div className="flex items-center gap-2 mt-2">
                                    <div
                                        className={`h-1.5 flex-1 rounded-full transition-colors ${isPasswordValid ? "bg-green-500" : "bg-gray-300"
                                            }`}
                                    ></div>
                                    <span className="text-xs font-medium text-gray-600">
                                        Min 6 characters
                                    </span>
                                </div>
                            </div>

                            {/* Confirm Password Field */}
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-gray-700 font-semibold">
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
                                        className="h-11 pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-800"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                {/* Password Match Indicator */}
                                {password.length > 0 && (
                                    <div className="flex items-center gap-2 mt-2">
                                        {isPasswordMatch ? (
                                            <Check className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <X className="w-4 h-4 text-red-500" />
                                        )}
                                        <span
                                            className={`text-xs font-medium ${isPasswordMatch ? "text-green-600" : "text-red-600"
                                                }`}
                                        >
                                            {isPasswordMatch ? "Passwords match" : "Passwords don't match"}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={loading || !isPasswordMatch}
                                className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
                            >
                                {loading ? "Creating account..." : "Create Account"}
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="my-6 relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
                            </div>
                        </div>

                        {/* Login Link */}
                        <Link
                            href="/login"
                            className="block w-full h-11 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg transition-all duration-200 flex items-center justify-center"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-white text-sm mt-6">
                    By creating an account, you agree to our{" "}
                    <Link href="#" className="underline hover:text-blue-200 transition-colors">
                        Terms of Service
                    </Link>
                </p>
            </div>
        </div>
    );
}
