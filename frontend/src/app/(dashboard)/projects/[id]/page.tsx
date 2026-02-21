'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getProjectDetail, updateTaskStatus } from '@/lib/projectApi';
import { ProjectWithRoadmap, TaskStatus } from '@/types/project';
import { ModuleFlowchart } from '@/components/ui/ModuleFlowchart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { AlertCircle, Calendar, Clock, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';

export default function ProjectDetailPage() {
    const params = useParams();
    const projectId = params.id as string;

    const [project, setProject] = useState<ProjectWithRoadmap | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchProject() {
            try {
                const data = await getProjectDetail(projectId);
                setProject(data);
            } catch {
                setError('Failed to load project.');
            } finally {
                setLoading(false);
            }
        }
        if (projectId) fetchProject();
    }, [projectId]);

    const handleTaskStatusChange = async (
        taskId: string,
        newStatus: TaskStatus
    ) => {
        try {
            await updateTaskStatus(projectId, taskId, { status: newStatus });

            setProject((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    modules: prev.modules.map((mod) => ({
                        ...mod,
                        tasks: mod.tasks.map((task) =>
                            task.id === taskId ? { ...task, status: newStatus } : task
                        ),
                    })),
                };
            });
        } catch {
            alert('Failed to update task status.');
        }
    };

    if (loading)
        return (
            <div className="flex min-h-screen items-center justify-center text-white">
                <div className="text-center">
                    <div className="animate-spin mb-4">
                        <Clock className="h-8 w-8 text-cyan-200" />
                    </div>
                    <p className="text-slate-300">Loading project details...</p>
                </div>
            </div>
        );

    if (error)
        return (
            <div className="max-w-6xl mx-auto px-4 py-8">
                <Alert className="border-red-300/40 bg-red-500/10 text-red-50">
                    <AlertCircle className="h-4 w-4 text-red-200" />
                    <AlertDescription className="text-red-100">{error}</AlertDescription>
                </Alert>
            </div>
        );

    if (!project)
        return (
            <div className="max-w-6xl mx-auto px-4 py-8">
                <Alert className="border-white/20 bg-white/10 text-slate-100">
                    <AlertCircle className="h-4 w-4 text-cyan-200" />
                    <AlertDescription>Project not found.</AlertDescription>
                </Alert>
            </div>
        );

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-emerald-500/20 text-emerald-200 border-emerald-300/40';
            case 'in_progress':
                return 'bg-cyan-500/20 text-cyan-200 border-cyan-300/40';
            case 'planning':
                return 'bg-violet-500/20 text-violet-200 border-violet-300/40';
            case 'archived':
                return 'bg-slate-500/20 text-slate-200 border-slate-300/40';
            default:
                return 'bg-slate-500/20 text-slate-200 border-slate-300/40';
        }
    };

    const getModeColor = (mode: string) => {
        return mode === 'deadline'
            ? 'bg-amber-500/20 text-amber-200 border-amber-300/40'
            : 'bg-cyan-500/20 text-cyan-200 border-cyan-300/40';
    };

    const totalTasks = project.modules.reduce((sum, m) => sum + m.tasks.length, 0);
    const completedTasks = project.modules.reduce(
        (sum, m) => sum + m.tasks.filter((t) => t.status === 'completed').length,
        0
    );
    const projectProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return (
        <div className="min-h-screen text-white">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <Card className="mb-8 rounded-xl border border-white/20 bg-white/10 p-8 text-white shadow-2xl backdrop-blur-xl">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">{project.title}</h1>
                            <p className="max-w-3xl text-lg text-slate-200/85">{project.description}</p>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/20 pt-6 md:grid-cols-4">
                        <div>
                            <p className="mb-1 text-sm text-slate-300">Status</p>
                            <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                                    project.status
                                )}`}
                            >
                                {project.status}
                            </span>
                        </div>
                        <div>
                            <p className="mb-1 text-sm text-slate-300">Mode</p>
                            <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getModeColor(
                                    project.planning_mode
                                )}`}
                            >
                                {project.planning_mode}
                            </span>
                        </div>
                        {project.deadline_date && (
                            <div>
                                <p className="mb-1 text-sm text-slate-300">Deadline</p>
                                <p className="font-semibold flex items-center gap-1">
                                    <Calendar className="h-4 w-4 text-cyan-200" />
                                    {project.deadline_date}
                                </p>
                            </div>
                        )}
                        <div>
                            <p className="mb-1 text-sm text-slate-300">Progress</p>
                            <p className="font-semibold">{projectProgress}%</p>
                        </div>
                    </div>
                </Card>

                <Card className="mb-8 rounded-lg border border-white/20 bg-white/10 p-6 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-cyan-200" />
                            <h3 className="font-semibold text-white">Overall Project Progress</h3>
                        </div>
                        <span className="text-sm font-medium text-slate-300">
                            {completedTasks}/{totalTasks} tasks completed
                        </span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-white/20">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500/90 to-cyan-400/90 transition-all duration-300"
                            style={{ width: `${projectProgress}%` }}
                        />
                    </div>
                </Card>

                <Tabs defaultValue="flowchart" className="w-full">
                    <TabsList className="mb-6 grid w-full grid-cols-2 rounded-lg border border-white/20 bg-white/10 p-1 shadow-sm lg:grid-cols-3">
                        <TabsTrigger value="flowchart" className="text-slate-200 data-[state=active]:bg-white/20 data-[state=active]:text-white">
                            Flowchart
                        </TabsTrigger>
                        <TabsTrigger value="modules" className="text-slate-200 data-[state=active]:bg-white/20 data-[state=active]:text-white">
                            Modules
                        </TabsTrigger>
                        <TabsTrigger value="tasks" className="text-slate-200 data-[state=active]:bg-white/20 data-[state=active]:text-white">
                            All Tasks
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="flowchart" className="rounded-lg border border-white/20 bg-white/10 p-6 shadow-sm backdrop-blur-xl">
                        <ModuleFlowchart modules={project.modules} />
                    </TabsContent>

                    <TabsContent value="modules" className="space-y-4">
                        {project.modules.map((module) => {
                            const moduleCompletedTasks = module.tasks.filter(
                                (t) => t.status === 'completed'
                            ).length;
                            const moduleProgress =
                                module.tasks.length > 0
                                    ? Math.round((moduleCompletedTasks / module.tasks.length) * 100)
                                    : 0;

                            return (
                                <Card
                                    key={module.id}
                                    className="rounded-lg border border-white/20 bg-white/10 p-6 backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.14]"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold text-white">
                                                    Module {module.order_index + 1}: {module.title}
                                                </h3>
                                                <span className="rounded-full border border-cyan-300/40 bg-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-200">
                                                    {module.estimated_days}d
                                                </span>
                                            </div>
                                            <p className="text-slate-300">{module.description}</p>
                                        </div>
                                    </div>

                                    <div className="mb-4 rounded-lg border border-white/20 bg-white/5 p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-slate-200">Progress</span>
                                            <span className="text-sm font-semibold text-cyan-200">
                                                {moduleCompletedTasks}/{module.tasks.length}
                                            </span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                                            <div
                                                className="h-full bg-gradient-to-r from-indigo-500/90 to-cyan-400/90 transition-all"
                                                style={{ width: `${moduleProgress}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-4 flex items-center gap-6 border-b border-white/20 pb-4 text-sm text-slate-300">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-cyan-200" />
                                            <span>
                                                <strong>Start:</strong> {module.start_date}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-indigo-200" />
                                            <span>
                                                <strong>End:</strong> {module.end_date}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="mb-3 font-semibold text-white">Tasks ({module.tasks.length})</h4>
                                        <div className="space-y-2">
                                            {module.tasks.map((task) => (
                                                <div
                                                    key={task.id}
                                                    className="flex items-start justify-between rounded-lg border border-white/20 bg-white/5 p-3 transition-colors hover:bg-white/10"
                                                >
                                                    <div className="flex-1">
                                                        <p className="font-medium text-white">{task.title}</p>
                                                        <p className="mt-1 text-sm text-slate-300">{task.description}</p>
                                                        <div className="mt-2 flex items-center gap-4 text-xs text-slate-300">
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {task.estimated_hours}h
                                                            </span>
                                                            {task.deadline && (
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="h-3 w-3" />
                                                                    {task.deadline}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="ml-4">
                                                        <Select
                                                            value={task.status}
                                                            onValueChange={(value: string) =>
                                                                handleTaskStatusChange(task.id, value as TaskStatus)
                                                            }
                                                        >
                                                            <SelectTrigger className="w-32 border-white/20 bg-white/5 text-xs text-white">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent className="border-white/20 bg-slate-900 text-white">
                                                                <SelectItem value="pending">Pending</SelectItem>
                                                                <SelectItem value="in_progress">In Progress</SelectItem>
                                                                <SelectItem value="completed">Completed</SelectItem>
                                                                <SelectItem value="blocked">Blocked</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </TabsContent>

                    <TabsContent value="tasks" className="space-y-3">
                        <Card className="mb-4 rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-xl">
                            <p className="text-sm text-slate-300">
                                Showing all {totalTasks} tasks across {project.modules.length} modules
                            </p>
                        </Card>
                        {project.modules.map((module) =>
                            module.tasks.map((task) => (
                                <Card
                                    key={task.id}
                                    className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.14]"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="rounded-full border border-cyan-300/40 bg-cyan-500/20 px-2 py-1 text-xs font-semibold text-cyan-200">
                                                    Module {module.order_index + 1}
                                                </span>
                                                <h4 className="font-semibold text-white">{task.title}</h4>
                                            </div>
                                            <p className="text-sm text-slate-300">{task.description}</p>
                                            <div className="mt-2 flex items-center gap-4 text-xs text-slate-300">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {task.estimated_hours}h
                                                </span>
                                                {task.deadline && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {task.deadline}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <Select
                                            value={task.status}
                                            onValueChange={(value: string) =>
                                                handleTaskStatusChange(task.id, value as TaskStatus)
                                            }
                                        >
                                            <SelectTrigger className="ml-4 w-32 border-white/20 bg-white/5 text-xs text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="border-white/20 bg-slate-900 text-white">
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="in_progress">In Progress</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="blocked">Blocked</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </Card>
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
