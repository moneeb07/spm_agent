"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

// ──────────────────────────────────────────────
// Protected Route Wrapper
// ──────────────────────────────────────────────
// Wrap any page/layout that requires authentication.
// Redirects to /login if the user is not authenticated.
//
// Usage:
//   <ProtectedRoute>
//     <YourPageContent />
//   </ProtectedRoute>
// ──────────────────────────────────────────────

interface ProtectedRouteProps {
    children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    // Show nothing while checking auth state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    // Not authenticated — will redirect via useEffect
    if (!user) {
        return null;
    }

    return <>{children}</>;
}
