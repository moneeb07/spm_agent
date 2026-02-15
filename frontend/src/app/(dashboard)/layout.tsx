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
            <div className="flex min-h-screen">
                {/* Fixed Sidebar */}
                <Sidebar />

                {/* Main Content Area */}
                <main className="flex-1 ml-64 bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 min-h-screen">
                    <div className="p-8">
                        {children}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
