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
            <div
                className="flex min-h-screen text-white"
                style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #111b33 40%, #0f172a 70%, #0c1322 100%)' }}
            >
                {/* Fixed Sidebar */}
                <Sidebar />

                {/* Main Content Area — full width on mobile, offset on lg+ */}
                <main className="relative min-h-screen flex-1 overflow-hidden pt-14 lg:ml-64 lg:pt-0">
                    <div className="pointer-events-none absolute -top-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-cyan-500/[0.06] blur-[120px]" />
                    <div className="pointer-events-none absolute -bottom-32 left-1/4 h-96 w-96 rounded-full bg-indigo-500/[0.06] blur-[120px]" />
                    <div className="relative p-4 sm:p-6 lg:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
