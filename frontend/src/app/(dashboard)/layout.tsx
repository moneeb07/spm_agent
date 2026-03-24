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

                {/* Main Content Area — full width on mobile, offset on lg+ */}
                <main className="relative min-h-screen flex-1 overflow-hidden bg-slate-950 pt-14 lg:ml-64 lg:pt-0">
                    <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-24 left-1/4 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
                    <div className="relative p-4 sm:p-6 lg:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
