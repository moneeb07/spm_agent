'use client';

import { useState, useEffect } from 'react';
import { getProjects, deleteProject } from '@/lib/projectApi';
import { Project } from '@/types/project';
import Link from 'next/link';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Trash2, ArrowRight, Zap, Clock, Flag } from 'lucide-react';

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchProjects() {
            try {
                const data = await getProjects();
                setProjects(data);
            } catch {
                setError('Failed to load projects.');
            } finally {
                setLoading(false);
            }
        }
        fetchProjects();
    }, []);

    const handleDelete = async (projectId: string) => {
        try {
            await deleteProject(projectId);
            setProjects((prev) => prev.filter((p) => p.id !== projectId));
        } catch {
            alert('Failed to delete project.');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-emerald-500/20 text-emerald-200 border-emerald-300/40';
            case 'active':
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
            ? 'border-amber-300/40 bg-amber-500/20 text-amber-200'
            : 'border-cyan-300/40 bg-cyan-500/20 text-cyan-200';
    };

    if (loading) {
        return (
            <div className="min-h-screen text-white">
                <div className="max-w-6xl mx-auto px-2 py-6 sm:px-4 sm:py-8 md:py-12">
                    <h1 className="mb-2 text-2xl font-bold text-white sm:text-3xl md:text-4xl">My Projects</h1>
                    <p className="mb-6 text-sm text-slate-300 sm:mb-8 sm:text-base">Loading your projects...</p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="animate-pulse rounded-xl border border-white/15 bg-white/[0.06] p-6"
                            >
                                <div className="mb-3 h-6 w-3/4 rounded bg-white/10" />
                                <div className="mb-4 h-4 w-full rounded bg-white/10" />
                                <div className="h-4 w-1/2 rounded bg-white/10" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white">
            <div className="max-w-6xl mx-auto px-2 py-6 sm:px-4 sm:py-8 md:py-12">
                <div className="mb-8 sm:mb-12">
                    <h1 className="mb-2 text-2xl font-bold text-white sm:text-3xl md:text-4xl">My Projects</h1>
                    <p className="text-sm text-slate-300 sm:text-base lg:text-lg">
                        Manage and track all your software development projects
                    </p>
                </div>

                {error && (
                    <Alert className="mb-8 border-red-300/40 bg-red-500/10 text-red-50">
                        <AlertDescription className="font-medium text-red-100">Error: {error}</AlertDescription>
                    </Alert>
                )}

                {!loading && projects.length === 0 && (
                    <Card className="py-16 text-center border border-dashed border-white/15 bg-white/[0.05] backdrop-blur-xl rounded-2xl">
                        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
                            <Flag className="h-8 w-8 text-cyan-200" />
                        </div>
                        <h3 className="mb-2 text-2xl font-bold text-white">No projects yet</h3>
                        <p className="mb-6 text-slate-300">
                            Start creating projects to manage your development workflow
                        </p>
                        <Link href="/dashboard">
                            <Button className="rounded-xl bg-amber-600 font-bold text-white shadow-lg transition-all duration-300 hover:bg-amber-500 hover:shadow-amber-600/25 hover:-translate-y-0.5">
                                <Zap className="w-4 h-4 mr-2" />
                                Go to Dashboard
                            </Button>
                        </Link>
                    </Card>
                )}

                {projects.length > 0 && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                        {projects.map((project) => {
                            const description = project.description.substring(0, 120);
                            const isLongDescription = project.description.length > 120;

                            return (
                                <Link href={`/projects/${project.id}`} key={project.id}>
                                    <Card className="group h-full overflow-hidden rounded-xl border border-white/15 bg-white/[0.06] shadow-2xl backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.10] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20">
                                        <div className="h-1 bg-amber-600/80 transition-all group-hover:h-1.5" />

                                        <div className="p-4 sm:p-6">
                                            <h3 className="mb-2 line-clamp-2 text-base font-bold text-white transition-colors group-hover:text-cyan-100 sm:text-lg lg:text-xl">
                                                {project.title}
                                            </h3>

                                            <p className="mb-4 line-clamp-3 text-sm text-slate-300">
                                                {description}
                                                {isLongDescription && '...'}
                                            </p>

                                            <div className="flex flex-wrap gap-2 mb-4">
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                                                        project.status
                                                    )}`}
                                                >
                                                    {project.status}
                                                </span>
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getModeColor(
                                                        project.planning_mode
                                                    )}`}
                                                >
                                                    {project.planning_mode === 'deadline' ? (
                                                        <>
                                                            <Flag className="w-3 h-3 mr-1" />
                                                            Deadline
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Clock className="w-3 h-3 mr-1" />
                                                            Flexible
                                                        </>
                                                    )}
                                                </span>
                                            </div>

                                            <div className="mb-4 space-y-2 border-t border-white/15 pb-4 pt-4">
                                                {project.deadline_date && (
                                                    <div className="flex items-center gap-2 text-sm text-slate-300">
                                                        <Calendar className="h-4 w-4 flex-shrink-0 text-cyan-200" />
                                                        <span>
                                                            <strong>Deadline:</strong> {project.deadline_date}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 text-sm text-slate-300">
                                                    <Clock className="h-4 w-4 flex-shrink-0 text-slate-400" />
                                                    <span>Created: {project.created_at}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 border-t border-white/15 pt-4">
                                                <Button className="flex-1 rounded-xl bg-amber-600 font-bold text-white shadow-lg transition-all duration-300 hover:bg-amber-500 hover:shadow-amber-600/25">
                                                    View Details
                                                    <ArrowRight className="w-4 h-4" />
                                                </Button>

                                                <AlertDialog>
                                                    <AlertDialogTrigger
                                                        asChild
                                                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => e.preventDefault()}
                                                    >
                                                        <Button variant="outline" size="icon" className="border-red-300/40 bg-red-500/10 text-red-200 hover:bg-red-500/20 hover:text-red-100">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogTitle>Delete Project</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to delete "{project.title}"? This action cannot
                                                            be undone.
                                                        </AlertDialogDescription>
                                                        <div className="flex gap-2 justify-end">
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDelete(project.id)}
                                                                className="bg-red-600 text-white hover:bg-red-700"
                                                            >
                                                                Delete
                                                            </AlertDialogAction>
                                                        </div>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
