'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';

export default function ProjectsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute>
            <div className="flex min-h-screen bg-slate-950 text-white">
                {/* Fixed Sidebar */}
                <Sidebar />

                {/* Main Content Area */}
                <main className="relative ml-64 min-h-screen flex-1 overflow-hidden bg-slate-950">
                    <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-24 left-1/4 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
                    <div className="relative p-8">
                        {children}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
