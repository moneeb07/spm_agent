"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/*
 * ═══════════════════════════════════════════════
 * SIDEBAR COMPONENT — Design this with Tailwind CSS
 * ═══════════════════════════════════════════════
 *
 * This sidebar appears on every dashboard page.
 * It provides navigation between Projects, Dashboard, and Profile.
 *
 * NAVIGATION ITEMS:
 *   1. Dashboard  → /dashboard
 *   2. Projects   → /projects
 *   3. Profile    → /profile
 *
 * BOTTOM SECTION:
 *   - Logout button
 *   - Optionally show user name/avatar
 *
 * BEHAVIOR:
 *   - `pathname` gives you the current route (for active link styling)
 *   - `logout` from useAuth handles sign-out + redirect
 *
 * DESIGN SUGGESTIONS:
 *   - Fixed left sidebar (w-64), full height
 *   - Dark background, light text
 *   - Active link has a highlight (bg color or left border)
 *   - App name/logo at the top
 *   - Logout button at the bottom
 * ═══════════════════════════════════════════════
 */

// Navigation items — add more as you build new pages
const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: "🏠" },
    { label: "Projects", href: "/projects", icon: "📁" },
    { label: "Profile", href: "/profile", icon: "👤" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    // Helper: check if a nav item is the current active page
    const isActive = (href: string) => pathname === href;

    // ─────────────────────────────────────────
    // YOUR TAILWIND DESIGN GOES BELOW
    // Use: navItems, isActive(), user, logout
    // ─────────────────────────────────────────

    return (
        <aside>
            {/*
        DESIGN YOUR SIDEBAR HERE

        Suggested structure:
        ┌──────────────────────────┐
        │  SPM Agent (logo/title)  │
        │──────────────────────────│
        │  🏠 Dashboard            │  ← Link to /dashboard
        │  📁 Projects             │  ← Link to /projects
        │  👤 Profile              │  ← Link to /profile
        │                          │
        │                          │
        │──────────────────────────│
        │  {user?.full_name}       │
        │  [Logout]                │  ← calls logout()
        └──────────────────────────┘

        Use `isActive(item.href)` to conditionally style the active link.

        Example nav rendering:
      */}

            <div>
                <h2>SPM Agent</h2>
            </div>

            <nav>
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                    // Add active styles: isActive(item.href) ? "bg-highlight" : ""
                    >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                    </Link>
                ))}
            </nav>

            <div>
                {/* User info + Logout */}
                <p>{user?.full_name || "Developer"}</p>
                <button onClick={logout}>Logout</button>
            </div>
        </aside>
    );
}
