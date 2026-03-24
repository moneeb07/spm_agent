'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUpcomingDeadlines } from '@/lib/projectApi';
import { DeadlineItem } from '@/types/project';
import { Calendar, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function DashboardPage() {
    const { user } = useAuth();
    const displayName = user?.full_name && user.full_name !== 'string' ? user.full_name : 'Developer';

    // Deadlines State
    const [deadlines, setDeadlines] = useState<DeadlineItem[]>([]);
    const [deadlinesLoading, setDeadlinesLoading] = useState(true);

    // Fetch Deadlines on Mount
    useEffect(() => {
        async function fetchDeadlines() {
            try {
                const data = await getUpcomingDeadlines();
                setDeadlines(data);
            } catch {
                console.error('Failed to load deadlines');
            } finally {
                setDeadlinesLoading(false);
            }
        }
        fetchDeadlines();
    }, []);

    return (
        <div className="min-h-screen text-white">
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
            </div>

            <div className="relative z-10">
                <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-6 shadow-2xl backdrop-blur-xl sm:px-6 sm:py-8 md:px-12 md:py-10">
                    <div className="max-w-6xl mx-auto">
                        <h1 className="mb-2 text-2xl font-bold sm:text-3xl md:text-4xl lg:text-5xl">Welcome back, {displayName}!</h1>
                        <p className="text-sm text-slate-200/80 sm:text-base lg:text-lg">Manage your projects and track deadlines with AI-powered planning</p>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-2 py-6 sm:px-4 sm:py-8 md:px-12 md:py-12">
                    <div>
                        <div className="flex items-center gap-2 mb-4 sm:mb-6">
                            <div className="h-6 w-1 rounded bg-cyan-300 sm:h-8" />
                            <h2 className="text-xl font-bold text-white sm:text-2xl">Upcoming Deadlines</h2>
                        </div>

                        {deadlinesLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-cyan-300" />
                            </div>
                        ) : deadlines.length === 0 ? (
                            <Card className="border border-dashed border-white/30 bg-white/5 p-12 text-center backdrop-blur-xl">
                                <Calendar className="mx-auto mb-4 h-12 w-12 text-cyan-200" />
                                <p className="font-medium text-slate-100">No upcoming deadlines</p>
                                <p className="mt-1 text-sm text-slate-300/80">Create a project to begin planning!</p>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {deadlines.map((d) => (
                                    <Card
                                        key={d.task_id}
                                        className="group cursor-pointer border border-white/20 bg-white/10 p-4 backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.14] sm:p-6"
                                    >
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="truncate text-sm font-semibold text-white transition-colors group-hover:text-cyan-100 sm:text-base">
                                                    {d.project_title}
                                                </h3>
                                                <p className="mt-1 truncate text-xs text-slate-300 sm:text-sm">{d.task_title}</p>
                                            </div>
                                            <div className="flex items-center gap-3 flex-shrink-0">
                                                <div className="text-left sm:text-right">
                                                    <div className="flex items-center gap-1 text-xs font-medium text-slate-200 sm:text-sm">
                                                        <Calendar size={14} className="text-cyan-200 sm:hidden" />
                                                        <Calendar size={16} className="hidden text-cyan-200 sm:block" />
                                                        {d.deadline}
                                                    </div>
                                                    <div className="mt-1 sm:mt-2">
                                                        <span
                                                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold sm:px-3 sm:py-1 ${d.status === 'completed'
                                                                ? 'bg-emerald-500/20 text-emerald-200'
                                                                : d.status === 'in-progress'
                                                                    ? 'bg-cyan-500/20 text-cyan-200'
                                                                    : 'bg-amber-500/20 text-amber-200'
                                                                }`}
                                                        >
                                                            {d.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <ChevronRight className="hidden text-slate-400 transition-colors group-hover:text-cyan-200 sm:block" size={20} />
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
