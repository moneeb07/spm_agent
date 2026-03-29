"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Home, FolderOpen, User, Zap, PlusCircle, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Create Project", href: "/create-project", icon: PlusCircle },
    { label: "Projects", href: "/projects", icon: FolderOpen },
    { label: "Profile", href: "/profile", icon: User },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [open, setOpen] = useState(false);

    const isActive = (href: string) => pathname === href;
    const displayName = user?.full_name && user.full_name !== "string" ? user.full_name : "Developer";

    return (
        <>
            {/* ── Mobile top bar ─────────────────────────────── */}
            <div className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between border-b border-white/15 bg-slate-950/80 px-4 backdrop-blur-2xl shadow-lg shadow-black/20 lg:hidden">
                <div className="flex items-center gap-2">
                    <div className="rounded-md bg-white/10 p-1.5 ring-1 ring-white/20">
                        <Zap className="h-4 w-4 text-cyan-200" />
                    </div>
                    <span className="text-sm font-bold text-white">SPM Agent</span>
                </div>
                <button
                    onClick={() => setOpen(!open)}
                    className="rounded-md p-2 text-slate-300 hover:bg-white/10 hover:text-white"
                >
                    {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

            {/* ── Mobile overlay ─────────────────────────────── */}
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* ── Sidebar drawer ─────────────────────────────── */}
            <aside
                className={`fixed left-0 top-0 z-50 flex min-h-screen w-64 flex-col border-r border-white/15 text-white transition-transform duration-300 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"
                    }`}
                style={{
                    background: 'rgba(2, 6, 23, 0.85)',
                    backdropFilter: 'blur(40px) saturate(180%)',
                    boxShadow: '4px 0 32px rgba(0, 0, 0, 0.4), inset -1px 0 0 rgba(255, 255, 255, 0.05)',
                }}
            >
                {/* Header */}
                <div className="border-b border-white/10 p-6 bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-white/10 p-2 ring-1 ring-white/20 shadow-lg shadow-cyan-500/5">
                                <Zap className="h-6 w-6 text-cyan-200" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">SPM Agent</h1>
                                <p className="text-xs text-slate-300">AI Product Manager</p>
                            </div>
                        </div>
                        {/* Close button on mobile only */}
                        <button
                            onClick={() => setOpen(false)}
                            className="rounded-md p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
                        >
                            <X className="h-5 w-5" />
                        </button>
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
                                    onClick={() => setOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${active
                                        ? "border border-white/20 bg-white/10 text-white shadow-lg font-semibold backdrop-blur-sm"
                                        : "text-slate-300 hover:bg-white/10 hover:text-white hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/20"
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
                    <div className="mb-4 rounded-xl border border-white/15 bg-white/[0.06] p-3 backdrop-blur-sm shadow-inner shadow-white/[0.02]">
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
                        className="w-full rounded-xl border-white/20 bg-white/5 text-slate-100 transition-all duration-300 hover:bg-white/10 hover:text-white hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/20"
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
        </>
    );
}
