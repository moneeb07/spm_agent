"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// ──────────────────────────────────────────────
// Root Page — Redirect Logic
// ────────────────────────────────────────────── 
// If authenticated → /dashboard
// If not → /login
// ──────────────────────────────────────────────-

export default function HomePage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (user) {
                router.push("/dashboard");
            } else {
                router.push("/login");
            }
        }
    }, [user, loading, router]);

    // Show a loading state while checking auth
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
        </div>
    );
}
