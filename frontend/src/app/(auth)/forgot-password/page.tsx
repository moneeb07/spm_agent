"use client";

import { useState } from "react";
import api from "@/lib/axios";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
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
                                <Mail className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
                        <p className="text-blue-100">We'll send you a link to reset it</p>
                    </div>

                    {/* Form Content */}
                    <div className="px-6 py-8">
                        {success ? (
                            <div className="text-center space-y-6">
                                {/* Success Icon */}
                                <div className="flex justify-center">
                                    <div className="bg-green-100 rounded-full p-4">
                                        <CheckCircle className="w-12 h-12 text-green-600" />
                                    </div>
                                </div>

                                {/* Success Message */}
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold text-gray-800">Check your email</h2>
                                    <p className="text-gray-600">
                                        If an account exists with <br />
                                        <span className="font-semibold text-blue-600">{email}</span>, we've
                                        sent a password reset link.
                                    </p>
                                </div>

                                {/* Additional Info */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-sm text-gray-700">
                                        The reset link will expire in 24 hours. If you don't see the email,
                                        check your spam folder.
                                    </p>
                                </div>

                                {/* Back to Login Button */}
                                <Link
                                    href="/login"
                                    className="block w-full h-11 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Login
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleForgotPassword} className="space-y-6">
                                {/* Error Alert */}
                                {error && (
                                    <Alert className="border-red-200 bg-red-50">
                                        <AlertDescription className="text-red-800 font-medium">
                                            {error}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {/* Description */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-sm text-gray-700">
                                        Enter the email address associated with your account, and we'll send
                                        you a link to reset your password.
                                    </p>
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

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Sending..." : "Send Reset Link"}
                                </Button>

                                {/* Divider */}
                                <div className="my-6 relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-200"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white text-gray-500">Remember your password?</span>
                                    </div>
                                </div>

                                {/* Back to Login Link */}
                                <Link
                                    href="/login"
                                    className="block w-full h-11 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Login
                                </Link>
                            </form>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-white text-sm mt-6">
                    Need help?{" "}
                    <Link href="#" className="underline hover:text-blue-200 transition-colors">
                        Contact Support
                    </Link>
                </p>
            </div>
        </div>
    );
}
