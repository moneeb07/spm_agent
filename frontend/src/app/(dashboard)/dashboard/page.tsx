'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { createProject, getUpcomingDeadlines } from '@/lib/projectApi';
import { CreateProjectRequest, DeadlineItem, PlanningMode } from '@/types/project';
import { useRouter } from 'next/navigation';
import { Calendar, Zap, AlertCircle, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';

export default function DashboardPage() {
    const { user } = useAuth();
    const router = useRouter();
    const displayName = user?.full_name && user.full_name !== 'string' ? user.full_name : 'Developer';

    // Project Creation State
    const [showWizard, setShowWizard] = useState(false);
    const [description, setDescription] = useState('');
    const [formData, setFormData] = useState<CreateProjectRequest>({
        title: '',
        description: '',
        tech_stack: [],
        planning_mode: 'open',
        working_hours_per_day: 6,
    });
    const [techStackInput, setTechStackInput] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState('');

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

    // Step 1: User writes description and clicks "Start Project"
    const handleStartProject = () => {
        if (!description.trim()) return;
        setFormData((prev) => ({ ...prev, description: description.trim() }));
        setShowWizard(true);
    };

    // Step 2: User fills in details and submits
    const handleCreateProject = async () => {
        setCreateError('');
        setIsCreating(true);

        try {
            const techStack = techStackInput
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);

            const requestData: CreateProjectRequest = {
                ...formData,
                tech_stack: techStack,
            };

            const project = await createProject(requestData);
            router.push(`/projects/${project.id}`);
        } catch (err: any) {
            console.log(err);
            setCreateError(err.response?.data?.detail || 'Failed to create project. Try again.');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="min-h-screen text-white">
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
            </div>

            <div className="relative z-10">
                <div className="rounded-2xl border border-white/20 bg-white/10 px-6 py-10 shadow-2xl backdrop-blur-xl md:px-12">
                    <div className="max-w-6xl mx-auto">
                        <h1 className="mb-2 text-4xl font-bold md:text-5xl">Welcome back, {displayName}!</h1>
                        <p className="text-lg text-slate-200/80">Manage your projects and track deadlines with AI-powered planning</p>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-6 py-12 md:px-12">
                    <div className="mb-12">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="h-8 w-1 rounded bg-cyan-300" />
                            <h2 className="text-2xl font-bold text-white">Start New Project</h2>
                        </div>

                        {!showWizard ? (
                            <Card className="border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.12]">
                                <div className="space-y-6">
                                    <div>
                                        <Label className="mb-3 block text-sm font-semibold text-slate-100">
                                            Project Description
                                        </Label>
                                        <Textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Describe your project idea... What are you building? What problem does it solve?"
                                            className="h-32 w-full resize-none border-white/20 bg-white/5 p-4 text-white placeholder:text-slate-300/60 transition-all duration-300 focus-visible:ring-white/50"
                                        />
                                    </div>
                                    <Button
                                        onClick={handleStartProject}
                                        disabled={!description.trim()}
                                        className="w-full rounded-xl bg-gradient-to-r from-indigo-500/90 to-cyan-400/90 py-3 font-semibold text-white transition-all duration-300 hover:scale-[1.01] hover:from-indigo-500 hover:to-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Plus size={20} />
                                        Start Project
                                    </Button>
                                </div>
                            </Card>
                        ) : (
                            <Card className="border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
                                <div className="space-y-6">
                                    <div>
                                        <Label className="mb-2 block text-sm font-semibold text-slate-100">
                                            Project Title
                                        </Label>
                                        <Input
                                            type="text"
                                            placeholder="Project Title"
                                            value={formData.title}
                                            onChange={(e) =>
                                                setFormData((prev) => ({ ...prev, title: e.target.value }))
                                            }
                                            className="w-full border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-slate-300/60 focus-visible:ring-white/50"
                                        />
                                    </div>

                                    <div>
                                        <Label className="mb-2 block text-sm font-semibold text-slate-100">
                                            Description
                                        </Label>
                                        <Textarea
                                            value={formData.description}
                                            onChange={(e) =>
                                                setFormData((prev) => ({ ...prev, description: e.target.value }))
                                            }
                                            placeholder="Project description"
                                            className="h-24 w-full resize-none border-white/20 bg-white/5 p-4 text-white placeholder:text-slate-300/60 focus-visible:ring-white/50"
                                        />
                                    </div>

                                    <div>
                                        <Label className="mb-2 block text-sm font-semibold text-slate-100">
                                            Tech Stack
                                        </Label>
                                        <Input
                                            type="text"
                                            placeholder="React, FastAPI, PostgreSQL (comma-separated)"
                                            value={techStackInput}
                                            onChange={(e) => setTechStackInput(e.target.value)}
                                            className="w-full border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-slate-300/60 focus-visible:ring-white/50"
                                        />
                                    </div>

                                    <div>
                                        <Label className="mb-4 block text-sm font-semibold text-slate-100">
                                            Planning Mode
                                        </Label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all" style={{
                                                borderColor: formData.planning_mode === 'deadline' ? 'rgba(103,232,249,0.5)' : 'rgba(255,255,255,0.2)',
                                                backgroundColor: formData.planning_mode === 'deadline' ? 'rgba(34,211,238,0.12)' : 'rgba(255,255,255,0.05)'
                                            }}>
                                                <input
                                                    type="radio"
                                                    name="planningMode"
                                                    value="deadline"
                                                    checked={formData.planning_mode === 'deadline'}
                                                    onChange={() =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            planning_mode: 'deadline' as PlanningMode,
                                                        }))
                                                    }
                                                    className="h-4 w-4 accent-cyan-300"
                                                />
                                                <div className="ml-3">
                                                    <div className="font-semibold text-white">Fixed Deadline</div>
                                                    <div className="text-sm text-slate-300">I have a specific end date</div>
                                                </div>
                                            </label>

                                            <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all" style={{
                                                borderColor: formData.planning_mode === 'open' ? 'rgba(103,232,249,0.5)' : 'rgba(255,255,255,0.2)',
                                                backgroundColor: formData.planning_mode === 'open' ? 'rgba(34,211,238,0.12)' : 'rgba(255,255,255,0.05)'
                                            }}>
                                                <input
                                                    type="radio"
                                                    name="planningMode"
                                                    value="open"
                                                    checked={formData.planning_mode === 'open'}
                                                    onChange={() =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            planning_mode: 'open' as PlanningMode,
                                                        }))
                                                    }
                                                    className="h-4 w-4 accent-cyan-300"
                                                />
                                                <div className="ml-3">
                                                    <div className="font-semibold text-white">Flexible Timeline</div>
                                                    <div className="text-sm text-slate-300">No fixed deadline</div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    {formData.planning_mode === 'deadline' && (
                                        <div>
                                            <Label className="mb-2 block text-sm font-semibold text-slate-100">
                                                Target Deadline
                                            </Label>
                                            <Input
                                                type="date"
                                                value={formData.deadline_date || ''}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        deadline_date: e.target.value,
                                                    }))
                                                }
                                                className="w-full border-white/20 bg-white/5 px-4 py-3 text-white focus-visible:ring-white/50"
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <Label className="mb-2 block text-sm font-semibold text-slate-100">
                                            Working Hours Per Day
                                        </Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            max={16}
                                            value={formData.working_hours_per_day}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    working_hours_per_day: Number(e.target.value),
                                                }))
                                            }
                                            placeholder="e.g., 6"
                                            className="w-full border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-slate-300/60 focus-visible:ring-white/50"
                                        />
                                        <p className="mt-2 text-sm text-slate-300/80">How many hours per day can you dedicate to this project?</p>
                                    </div>

                                    {createError && (
                                        <Alert className="border-red-300/40 bg-red-500/10 text-red-50">
                                            <AlertCircle className="h-4 w-4 text-red-200" />
                                            <AlertDescription className="text-red-100">{createError}</AlertDescription>
                                        </Alert>
                                    )}

                                    <div className="flex gap-4 pt-4">
                                        <Button
                                            onClick={handleCreateProject}
                                            disabled={isCreating}
                                            className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500/90 to-cyan-400/90 py-3 font-semibold text-white transition-all duration-300 hover:scale-[1.01] hover:from-indigo-500 hover:to-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {isCreating ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    <Zap size={20} />
                                                    Generate Roadmap
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setShowWizard(false);
                                                setCreateError('');
                                            }}
                                            variant="outline"
                                            className="flex-1 rounded-xl border-white/30 bg-white/5 py-3 font-semibold text-white transition-all duration-300 hover:border-white/50 hover:bg-white/10"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="h-8 w-1 rounded bg-cyan-300" />
                            <h2 className="text-2xl font-bold text-white">Upcoming Deadlines</h2>
                        </div>

                        {deadlinesLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-cyan-300" />
                            </div>
                        ) : deadlines.length === 0 ? (
                            <Card className="border border-dashed border-white/30 bg-white/5 p-12 text-center backdrop-blur-xl">
                                <Calendar className="mx-auto mb-4 h-12 w-12 text-cyan-200" />
                                <p className="font-medium text-slate-100">No upcoming deadlines</p>
                                <p className="mt-1 text-sm text-slate-300/80">Start a project above to begin planning!</p>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {deadlines.map((d) => (
                                    <Card
                                        key={d.task_id}
                                        className="group cursor-pointer border border-white/20 bg-white/10 p-6 backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.14]"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="truncate font-semibold text-white transition-colors group-hover:text-cyan-100">
                                                    {d.project_title}
                                                </h3>
                                                <p className="mt-1 truncate text-sm text-slate-300">{d.task_title}</p>
                                            </div>
                                            <div className="flex items-center gap-3 flex-shrink-0">
                                                <div className="text-right">
                                                    <div className="flex items-center gap-1 text-sm font-medium text-slate-200">
                                                        <Calendar size={16} className="text-cyan-200" />
                                                        {d.deadline}
                                                    </div>
                                                    <div className="mt-2">
                                                        <span
                                                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${d.status === 'completed'
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
                                                <ChevronRight className="text-slate-400 transition-colors group-hover:text-cyan-200" size={20} />
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
