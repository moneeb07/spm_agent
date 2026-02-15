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
                return 'bg-green-100 border-green-400 text-green-700';
            case 'in_progress':
                return 'bg-blue-100 border-blue-400 text-blue-700';
            case 'pending':
                return 'bg-slate-100 border-slate-400 text-slate-700';
            case 'blocked':
                return 'bg-red-100 border-red-400 text-red-700';
            default:
                return 'bg-slate-100 border-slate-400 text-slate-700';
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
            {/* Header */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Module Progression Flow</h3>
                <p className="text-sm text-slate-600">
                    Visual flow showing how modules progress and their originating tasks
                </p>
            </div>

            {/* Flowchart */}
            <div className="space-y-4">
                {modules.map((module, idx) => (
                    <div key={module.id}>
                        {/* Module Node */}
                        <div className={`p-4 rounded-lg border-2 ${getStatusColor(module.status)} transition-all hover:shadow-md`}>
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(module.status)}
                                    <div>
                                        <h4 className="font-semibold text-sm">
                                            Module {module.order_index + 1}: {module.title}
                                        </h4>
                                        <p className="text-xs opacity-75 mt-1">{module.description}</p>
                                    </div>
                                </div>
                                <span className="text-xs font-medium px-2 py-1 rounded bg-white bg-opacity-50">
                                    {module.estimated_days}d
                                </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-3">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-medium">Progress</span>
                                    <span className="text-xs font-medium">
                                        {completedTasks(module)}/{totalTasks(module)} tasks
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-white bg-opacity-40 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-300"
                                        style={{ width: `${progressPercent(module)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Date Range */}
                            <div className="text-xs text-opacity-75 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {module.start_date} → {module.end_date}
                            </div>
                        </div>

                        {/* Tasks originating from this module */}
                        {module.tasks.length > 0 && (
                            <div className="ml-8 mt-2 space-y-2 border-l-2 border-blue-300 pl-4">
                                {module.tasks.map((task, taskIdx) => {
                                    const taskStatusColor = {
                                        completed: 'bg-green-50 border-green-200',
                                        in_progress: 'bg-blue-50 border-blue-200',
                                        pending: 'bg-slate-50 border-slate-200',
                                        blocked: 'bg-red-50 border-red-200',
                                    }[task.status] || 'bg-slate-50 border-slate-200';

                                    return (
                                        <div
                                            key={task.id}
                                            className={`p-3 rounded border-l-4 ${taskStatusColor} transition-all hover:shadow-sm`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-slate-900">{task.title}</p>
                                                    <p className="text-xs text-slate-600 mt-1">{task.description}</p>
                                                </div>
                                                <span className="text-xs font-semibold px-2 py-1 rounded bg-white bg-opacity-60 whitespace-nowrap">
                                                    {task.estimated_hours}h
                                                </span>
                                            </div>
                                            {task.deadline && (
                                                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    Due: {task.deadline}
                                                </p>
                                            )}
                                            <div className="mt-2 flex gap-1">
                                                <span
                                                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${task.status === 'completed'
                                                        ? 'bg-green-200 text-green-800'
                                                        : task.status === 'in_progress'
                                                            ? 'bg-blue-200 text-blue-800'
                                                            : task.status === 'blocked'
                                                                ? 'bg-red-200 text-red-800'
                                                                : 'bg-slate-200 text-slate-800'
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

                        {/* Arrow to next module */}
                        {idx < modules.length - 1 && (
                            <div className="flex justify-center py-2">
                                <ArrowRight className="w-5 h-5 text-blue-400 rotate-90" />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
