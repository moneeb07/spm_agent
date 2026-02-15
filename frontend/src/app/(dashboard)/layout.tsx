"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";

// ──────────────────────────────────────────────
// Dashboard Layout
// ──────────────────────────────────────────────
// All pages under (dashboard)/ are wrapped in ProtectedRoute + Sidebar.
// If not authenticated, user is redirected to /login.
// ──────────────────────────────────────────────

/*
 * ═══════════════════════════════════════════════
 * DASHBOARD LAYOUT — Design this with Tailwind CSS
 * ═══════════════════════════════════════════════
 *
 * STRUCTURE:
 *   1. Sidebar (left) — the <Sidebar /> component handles nav
 *   2. Main content area (right) — {children} renders here
 *
 * LAYOUT SUGGESTION:
 *   - Use flex: sidebar on left (fixed width), content fills rest
 *   - Sidebar: w-64, fixed or sticky, full height
 *   - Content: flex-1, with padding
 *   - On mobile: sidebar could be a slide-out drawer (optional)
 * ═══════════════════════════════════════════════
 */

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute>
            <div className="min-h-screen flex">
                {/* 
          Sidebar lives here — it has its own nav links and logout.
          Style it in components/Sidebar.tsx
        */}
                <Sidebar />

                {/* 
          Main content area — each page renders here.
          Add padding, background color, etc. as needed.
        */}
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
}
