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
                return 'bg-green-100 text-green-800 border-green-200';
            case 'active':
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
            ? 'border-orange-300 bg-orange-50'
            : 'border-cyan-300 bg-cyan-50';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50">
                <div className="max-w-6xl mx-auto px-4 py-12">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">My Projects</h1>
                    <p className="text-slate-600 mb-8">Loading your projects...</p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="bg-white rounded-lg p-6 shadow-sm animate-pulse"
                            >
                                <div className="h-6 bg-slate-200 rounded mb-3 w-3/4" />
                                <div className="h-4 bg-slate-200 rounded mb-4 w-full" />
                                <div className="h-4 bg-slate-200 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50">
            <div className="max-w-6xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">My Projects</h1>
                    <p className="text-slate-600 text-lg">
                        Manage and track all your software development projects
                    </p>
                </div>

                {/* Error State */}
                {error && (
                    <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800 font-medium">
                            Error: {error}
                        </p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && projects.length === 0 && (
                    <div className="text-center py-16">
                        <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100">
                            <Flag className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">No projects yet</h3>
                        <p className="text-slate-600 mb-6">
                            Start creating projects to manage your development workflow
                        </p>
                        <Link href="/dashboard">
                            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">
                                <Zap className="w-4 h-4 mr-2" />
                                Go to Dashboard
                            </Button>
                        </Link>
                    </div>
                )}

                {/* Projects Grid */}
                {projects.length > 0 && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => {
                            const description = project.description.substring(0, 120);
                            const isLongDescription = project.description.length > 120;

                            return (
                                <Link href={`/projects/${project.id}`} key={project.id}>
                                    <div className="group h-full bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-slate-100 hover:border-blue-300">
                                        {/* Card Header */}
                                        <div className="h-1 bg-gradient-to-r from-blue-600 to-cyan-600 group-hover:h-2 transition-all" />

                                        <div className="p-6">
                                            {/* Title */}
                                            <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                {project.title}
                                            </h3>

                                            {/* Description */}
                                            <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                                                {description}
                                                {isLongDescription && '...'}
                                            </p>

                                            {/* Badges */}
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

                                            {/* Meta Info */}
                                            <div className="space-y-2 mb-4 pb-4 border-t border-slate-200">
                                                {project.deadline_date && (
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                                        <span>
                                                            <strong>Deadline:</strong> {project.deadline_date}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                                    <span>Created: {project.created_at}</span>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
                                                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium hover:from-blue-700 hover:to-cyan-700 transition-all">
                                                    View Details
                                                    <ArrowRight className="w-4 h-4" />
                                                </button>

                                                <AlertDialog>
                                                    <AlertDialogTrigger
                                                        asChild
                                                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => e.preventDefault()}
                                                    >
                                                        <button className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
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
                                                                className="bg-red-600 hover:bg-red-700"
                                                            >
                                                                Delete
                                                            </AlertDialogAction>
                                                        </div>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
