'use client';

import { Module } from '@/types/project';
import { ArrowRight, Circle, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

interface ModuleFlowchartProps {
    modules: Module[];
}

export function ModuleFlowchart({ modules }: ModuleFlowchartProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'border-emerald-300/40 bg-emerald-500/15 text-emerald-100';
            case 'in_progress':
                return 'border-cyan-300/40 bg-cyan-500/15 text-cyan-100';
            case 'pending':
                return 'border-slate-300/30 bg-white/5 text-slate-100';
            case 'blocked':
                return 'border-rose-300/40 bg-rose-500/15 text-rose-100';
            default:
                return 'border-slate-300/30 bg-white/5 text-slate-100';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle2 className="w-5 h-5" />;
            case 'in_progress':
                return <Clock className="w-5 h-5" />;
            case 'blocked':
                return <AlertCircle className="w-5 h-5" />;
            default:
                return <Circle className="w-5 h-5" />;
        }
    };

    const completedTasks = (module: Module) =>
        module.tasks.filter((t) => t.status === 'completed').length;
    const totalTasks = (module: Module) => module.tasks.length;
    const progressPercent = (module: Module) =>
        totalTasks(module) > 0 ? Math.round((completedTasks(module) / totalTasks(module)) * 100) : 0;

    return (
        <div className="w-full">
            <div className="mb-6">
                <h3 className="mb-2 text-lg font-semibold text-cyan-200">Module Progression Flow</h3>
                <p className="text-sm text-slate-300">
                    Visual flow showing how modules progress and their originating tasks
                </p>
            </div>

            <div className="space-y-4">
                {modules.map((module, idx) => (
                    <div key={module.id}>
                        <div className={`rounded-lg border p-4 shadow-xl backdrop-blur-xl transition-all duration-300 hover:bg-white/10 ${getStatusColor(module.status)}`}>
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(module.status)}
                                    <div>
                                        <h4 className="font-semibold text-sm">
                                            Module {module.order_index + 1}: {module.title}
                                        </h4>
                                        <p className="mt-1 text-xs text-slate-300">{module.description}</p>
                                    </div>
                                </div>
                                <span className="rounded border border-white/20 bg-white/10 px-2 py-1 text-xs font-medium text-slate-100">
                                    {module.estimated_days}d
                                </span>
                            </div>

                            <div className="mb-3">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-medium text-slate-200">Progress</span>
                                    <span className="text-xs font-medium text-slate-200">
                                        {completedTasks(module)}/{totalTasks(module)} tasks
                                    </span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-indigo-500/90 to-cyan-400/90 transition-all duration-300"
                                        style={{ width: `${progressPercent(module)}%` }}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-1 text-xs text-slate-300">
                                <Clock className="w-3 h-3" />
                                {module.start_date} → {module.end_date}
                            </div>
                        </div>

                        {module.tasks.length > 0 && (
                            <div className="ml-8 mt-2 space-y-2 border-l-2 border-cyan-300/30 pl-4">
                                {module.tasks.map((task, taskIdx) => {
                                    const taskStatusColor = {
                                        completed: 'border-emerald-300/30 bg-emerald-500/10',
                                        in_progress: 'border-cyan-300/30 bg-cyan-500/10',
                                        pending: 'border-slate-300/20 bg-white/5',
                                        blocked: 'border-rose-300/30 bg-rose-500/10',
                                    }[task.status] || 'border-slate-300/20 bg-white/5';

                                    return (
                                        <div
                                            key={task.id}
                                            className={`rounded border-l-4 p-3 transition-all duration-300 hover:bg-white/10 ${taskStatusColor}`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-slate-100">{task.title}</p>
                                                    <p className="mt-1 text-xs text-slate-300">{task.description}</p>
                                                </div>
                                                <span className="whitespace-nowrap rounded border border-white/20 bg-white/10 px-2 py-1 text-xs font-semibold text-slate-100">
                                                    {task.estimated_hours}h
                                                </span>
                                            </div>
                                            {task.deadline && (
                                                <p className="mt-2 flex items-center gap-1 text-xs text-slate-300">
                                                    <Clock className="w-3 h-3" />
                                                    Due: {task.deadline}
                                                </p>
                                            )}
                                            <div className="mt-2 flex gap-1">
                                                <span
                                                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${task.status === 'completed'
                                                        ? 'bg-emerald-500/20 text-emerald-200'
                                                        : task.status === 'in_progress'
                                                            ? 'bg-cyan-500/20 text-cyan-200'
                                                            : task.status === 'blocked'
                                                                ? 'bg-rose-500/20 text-rose-200'
                                                                : 'bg-slate-500/20 text-slate-200'
                                                        }`}
                                                >
                                                    {task.status}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {idx < modules.length - 1 && (
                            <div className="flex justify-center py-2">
                                <ArrowRight className="w-5 h-5 text-cyan-300/70 rotate-90" />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
