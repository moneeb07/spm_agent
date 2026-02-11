"use client";

import { useAuth } from "@/context/AuthContext";

/*
 * ═══════════════════════════════════════════════
 * DASHBOARD PAGE — Design this with Tailwind CSS
 * ═══════════════════════════════════════════════
 *
 * This is the main landing page after login.
 * For the MVP, display a welcome message and basic user info.
 * This will later become the project overview / progress dashboard.
 *
 * DATA AVAILABLE (from useAuth):
 *   - user.full_name
 *   - user.email
 *   - user.skill_level
 *   - user.available_hours_per_day
 *   - user.preferred_pace
 *
 * SUGGESTED SECTIONS:
 *   1. Welcome header: "Welcome back, {user.full_name}!"
 *   2. Quick stats cards (placeholder for now):
 *      - Active Projects: 0
 *      - Tasks In Progress: 0
 *      - Upcoming Deadlines: None
 *   3. "Create New Project" button (future — just a placeholder button)
 *   4. Recent activity feed (future — empty state message)
 *
 * BUTTONS:
 *   1. "Create New Project" → placeholder for now (alert or no-op)
 *   2. "Logout" → calls logout() from useAuth
 *
 * LAYOUT SUGGESTION:
 *   Grid layout with stat cards at top, activity feed below.
 * ═══════════════════════════════════════════════
 */

export default function DashboardPage() {
    const { user, logout } = useAuth();

    // ─────────────────────────────────────────
    // YOUR TAILWIND DESIGN GOES BELOW
    // Use: user (UserProfile), logout()
    // ─────────────────────────────────────────

    return (
        <div>
            {/* 
        DESIGN YOUR DASHBOARD PAGE HERE
        
        Available data:
        - user?.full_name
        - user?.email
        - user?.skill_level
        - user?.available_hours_per_day
        - user?.preferred_pace
        
        Available actions:
        - logout() — logs out and redirects to /login
      */}
            <h1>Welcome back, {user?.full_name || "Developer"}!</h1>
            <p>Email: {user?.email}</p>

            <button onClick={logout}>Logout</button>
        </div>
    );
}
