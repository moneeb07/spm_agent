"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Home, FolderOpen, User, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Projects", href: "/projects", icon: FolderOpen },
    { label: "Profile", href: "/profile", icon: User },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const isActive = (href: string) => pathname === href;
    const displayName = user?.full_name && user.full_name !== "string" ? user.full_name : "Developer";

    return (
        <aside className="fixed left-0 top-0 z-50 flex min-h-screen w-64 flex-col border-r border-white/10 bg-slate-950/95 text-white backdrop-blur-xl">
            {/* Header */}
            <div className="border-b border-white/10 p-6">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-white/10 p-2 ring-1 ring-white/20">
                        <Zap className="h-6 w-6 text-cyan-200" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">SPM Agent</h1>
                        <p className="text-xs text-slate-300">AI Product Manager</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6">
                <div className="space-y-2">
                    {navItems.map((item) => {
                        const IconComponent = item.icon;
                        const active = isActive(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${active
                                        ? "border border-white/20 bg-white/15 text-white shadow-lg font-semibold"
                                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                                    }`}
                            >
                                <IconComponent className="w-5 h-5" />
                                <span>{item.label}</span>
                                {active && (
                                    <div className="ml-auto h-2 w-2 rounded-full bg-cyan-300"></div>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Divider */}
            <div className="border-t border-white/10 px-4 py-4">
                {/* User Info */}
                <div className="mb-4 rounded-lg border border-white/10 bg-white/5 p-3">
                    <p className="truncate text-sm font-medium text-white">
                        {displayName}
                    </p>
                    <p className="truncate text-xs text-slate-300">
                        {user?.email || "user@example.com"}
                    </p>
                </div>

                {/* Logout Button */}
                <Button
                    onClick={logout}
                    variant="outline"
                    className="w-full border-white/20 bg-white/5 text-slate-100 transition-colors hover:bg-white/10 hover:text-white"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                </Button>
            </div>

            {/* Footer Badge */}
            <div className="border-t border-white/10 px-4 py-3 text-center">
                <p className="text-xs text-slate-400">v1.0 • AI Powered</p>
            </div>
        </aside>
    );
}
