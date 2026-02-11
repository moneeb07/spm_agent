"use client";

import ProtectedRoute from "@/components/ProtectedRoute";

// ──────────────────────────────────────────────
// Dashboard Layout
// ──────────────────────────────────────────────
// All pages under (dashboard)/ are wrapped in ProtectedRoute.
// If not authenticated, user is redirected to /login.
//
// DESIGN NOTE: Add your sidebar, top nav bar, etc. here.
// This layout wraps ALL authenticated pages.
// ──────────────────────────────────────────────

/*
 * ═══════════════════════════════════════════════
 * DASHBOARD LAYOUT — Design this with Tailwind CSS
 * ═══════════════════════════════════════════════
 *
 * SUGGESTED ELEMENTS:
 *   1. Sidebar (left) with navigation links:
 *      - Dashboard
 *      - Projects (future)
 *      - Settings (future)
 *      - Logout button
 *
 *   2. Top bar with:
 *      - App name / logo
 *      - User name / avatar (from useAuth().user)
 *      - Notification bell (future)
 *
 *   3. Main content area where {children} renders
 *
 * LAYOUT SUGGESTION:
 *   flex with sidebar on left, content on right.
 *   Sidebar can be collapsible on mobile.
 * ═══════════════════════════════════════════════
 */

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute>
            <div className="min-h-screen">
                {/* 
          DESIGN YOUR DASHBOARD LAYOUT HERE
          
          Suggested structure:
          - Sidebar navigation (left)
          - Main content area (right) → {children}
          - Top bar with user info
          
          Use useAuth() to access:
          - user.full_name
          - user.email
          - logout()
        */}
                <main>{children}</main>
            </div>
        </ProtectedRoute>
    );
}
