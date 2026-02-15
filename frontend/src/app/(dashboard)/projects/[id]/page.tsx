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
import { AlertCircle, Calendar, CheckCircle2, Clock, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-slate-50">
                <div className="text-center">
                    <div className="animate-spin mb-4">
                        <Clock className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-slate-600">Loading project details...</p>
                </div>
            </div>
        );

    if (error)
        return (
            <div className="max-w-6xl mx-auto px-4 py-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );

    if (!project)
        return (
            <div className="max-w-6xl mx-auto px-4 py-8">
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Project not found.</AlertDescription>
                </Alert>
            </div>
        );

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'planning':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'archived':
                return 'bg-slate-100 text-slate-800 border-slate-200';
            default:
                return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    const getModeColor = (mode: string) => {
        return mode === 'deadline'
            ? 'bg-orange-100 text-orange-800 border-orange-200'
            : 'bg-cyan-100 text-cyan-800 border-cyan-200';
    };

    const totalTasks = project.modules.reduce((sum, m) => sum + m.tasks.length, 0);
    const completedTasks = project.modules.reduce(
        (sum, m) => sum + m.tasks.filter((t) => t.status === 'completed').length,
        0
    );
    const projectProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Project Header */}
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-8 text-white mb-8 shadow-lg">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">{project.title}</h1>
                            <p className="text-blue-100 text-lg max-w-3xl">{project.description}</p>
                        </div>
                    </div>

                    {/* Header Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-blue-400">
                        <div>
                            <p className="text-blue-100 text-sm mb-1">Status</p>
                            <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                                    project.status
                                )}`}
                            >
                                {project.status}
                            </span>
                        </div>
                        <div>
                            <p className="text-blue-100 text-sm mb-1">Mode</p>
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
                                <p className="text-blue-100 text-sm mb-1">Deadline</p>
                                <p className="font-semibold flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {project.deadline_date}
                                </p>
                            </div>
                        )}
                        <div>
                            <p className="text-blue-100 text-sm mb-1">Progress</p>
                            <p className="font-semibold">{projectProgress}%</p>
                        </div>
                    </div>
                </div>

                {/* Overall Progress Bar */}
                <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-blue-600" />
                            <h3 className="font-semibold text-slate-900">Overall Project Progress</h3>
                        </div>
                        <span className="text-sm font-medium text-slate-600">
                            {completedTasks}/{totalTasks} tasks completed
                        </span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300 rounded-full"
                            style={{ width: `${projectProgress}%` }}
                        />
                    </div>
                </div>

                {/* Tabs Section */}
                <Tabs defaultValue="flowchart" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 bg-white rounded-lg shadow-sm mb-6">
                        <TabsTrigger value="flowchart" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                            Flowchart
                        </TabsTrigger>
                        <TabsTrigger value="modules" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                            Modules
                        </TabsTrigger>
                        <TabsTrigger value="tasks" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                            All Tasks
                        </TabsTrigger>
                    </TabsList>

                    {/* Flowchart Tab */}
                    <TabsContent value="flowchart" className="bg-white rounded-lg p-6 shadow-sm">
                        <ModuleFlowchart modules={project.modules} />
                    </TabsContent>

                    {/* Modules Tab */}
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
                                <div
                                    key={module.id}
                                    className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    {/* Module Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold text-slate-900">
                                                    Module {module.order_index + 1}: {module.title}
                                                </h3>
                                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                                    {module.estimated_days}d
                                                </span>
                                            </div>
                                            <p className="text-slate-600">{module.description}</p>
                                        </div>
                                    </div>

                                    {/* Module Progress */}
                                    <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-slate-700">Progress</span>
                                            <span className="text-sm font-semibold text-blue-600">
                                                {moduleCompletedTasks}/{module.tasks.length}
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-300 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
                                                style={{ width: `${moduleProgress}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Date Range */}
                                    <div className="flex items-center gap-6 text-sm text-slate-600 mb-4 pb-4 border-b border-slate-200">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-blue-600" />
                                            <span>
                                                <strong>Start:</strong> {module.start_date}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-cyan-600" />
                                            <span>
                                                <strong>End:</strong> {module.end_date}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Tasks Grid */}
                                    <div>
                                        <h4 className="font-semibold text-slate-900 mb-3">Tasks ({module.tasks.length})</h4>
                                        <div className="space-y-2">
                                            {module.tasks.map((task) => (
                                                <div
                                                    key={task.id}
                                                    className="flex items-start justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                                                >
                                                    <div className="flex-1">
                                                        <p className="font-medium text-slate-900">{task.title}</p>
                                                        <p className="text-sm text-slate-600 mt-1">{task.description}</p>
                                                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {task.estimated_hours}h
                                                            </span>
                                                            {task.deadline && (
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="w-3 h-3" />
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
                                                            <SelectTrigger className="w-32 text-xs">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
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
                                </div>
                            );
                        })}
                    </TabsContent>

                    {/* All Tasks Tab */}
                    <TabsContent value="tasks" className="space-y-3">
                        <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
                            <p className="text-sm text-slate-600">
                                Showing all {totalTasks} tasks across {project.modules.length} modules
                            </p>
                        </div>
                        {project.modules.map((module) =>
                            module.tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="px-2 py-1 text-xs rounded-full font-semibold bg-blue-100 text-blue-800">
                                                    Module {module.order_index + 1}
                                                </span>
                                                <h4 className="font-semibold text-slate-900">{task.title}</h4>
                                            </div>
                                            <p className="text-slate-600 text-sm">{task.description}</p>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {task.estimated_hours}h
                                                </span>
                                                {task.deadline && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
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
                                            <SelectTrigger className="w-32 text-xs ml-4">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="in_progress">In Progress</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="blocked">Blocked</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
