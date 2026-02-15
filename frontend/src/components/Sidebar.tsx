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

    return (
        <aside className="w-64 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white min-h-screen flex flex-col shadow-lg fixed left-0 top-0 z-50">
            {/* Header */}
            <div className="p-6 border-b border-blue-700">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-blue-400 to-cyan-400 p-2 rounded-lg">
                        <Zap className="w-6 h-6 text-blue-900" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">SPM Agent</h1>
                        <p className="text-xs text-blue-200">AI Product Manager</p>
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
                                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg font-semibold"
                                        : "text-blue-100 hover:bg-blue-700/50 hover:text-white"
                                    }`}
                            >
                                <IconComponent className="w-5 h-5" />
                                <span>{item.label}</span>
                                {active && (
                                    <div className="ml-auto w-2 h-2 bg-cyan-300 rounded-full"></div>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Divider */}
            <div className="px-4 py-4 border-t border-blue-700">
                {/* User Info */}
                <div className="mb-4 p-3 bg-blue-700/30 rounded-lg">
                    <p className="text-sm font-medium text-white truncate">
                        {user?.full_name || "Developer"}
                    </p>
                    <p className="text-xs text-blue-200 truncate">
                        {user?.email || "user@example.com"}
                    </p>
                </div>

                {/* Logout Button */}
                <Button
                    onClick={logout}
                    variant="outline"
                    className="w-full flex items-center gap-2 bg-red-600/20 border-red-500/50 text-red-100 hover:bg-red-600/40 hover:border-red-500 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                </Button>
            </div>

            {/* Footer Badge */}
            <div className="px-4 py-3 border-t border-blue-700 text-center">
                <p className="text-xs text-blue-300">v1.0 • AI Powered</p>
            </div>
        </aside>
    );
}
