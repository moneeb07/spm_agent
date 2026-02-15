'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { createProject, getUpcomingDeadlines } from '@/lib/projectApi';
import { CreateProjectRequest, DeadlineItem, PlanningMode } from '@/types/project';
import { useRouter } from 'next/navigation';
import { Calendar, Zap, AlertCircle, Check, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function DashboardPage() {
    const { user } = useAuth();
    const router = useRouter();

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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
            {/* Decorative blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white px-6 py-12 md:px-12">
                    <div className="max-w-6xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-bold mb-2">Welcome back, {user?.full_name || 'Developer'}!</h1>
                        <p className="text-blue-100 text-lg">Manage your projects and track deadlines with AI-powered planning</p>
                    </div>
                </div>

                {/* Main Container */}
                <div className="max-w-6xl mx-auto px-6 py-12 md:px-12">
                    {/* New Project Section */}
                    <div className="mb-12">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-1 h-8 bg-blue-600 rounded"></div>
                            <h2 className="text-2xl font-bold text-gray-900">Start New Project</h2>
                        </div>

                        {!showWizard ? (
                            <Card className="border-2 border-blue-200 bg-white p-8 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Project Description
                                        </label>
                                        <Textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Describe your project idea... What are you building? What problem does it solve?"
                                            className="w-full h-32 p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 resize-none"
                                        />
                                    </div>
                                    <Button
                                        onClick={handleStartProject}
                                        disabled={!description.trim()}
                                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Plus size={20} />
                                        Start Project
                                    </Button>
                                </div>
                            </Card>
                        ) : (
                            <Card className="border-2 border-blue-200 bg-white p-8 shadow-lg">
                                <div className="space-y-6">
                                    {/* Title */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Project Title
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="Project Title"
                                            value={formData.title}
                                            onChange={(e) =>
                                                setFormData((prev) => ({ ...prev, title: e.target.value }))
                                            }
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                        />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Description
                                        </label>
                                        <Textarea
                                            value={formData.description}
                                            onChange={(e) =>
                                                setFormData((prev) => ({ ...prev, description: e.target.value }))
                                            }
                                            placeholder="Project description"
                                            className="w-full h-24 p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 resize-none"
                                        />
                                    </div>

                                    {/* Tech Stack */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Tech Stack
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="React, FastAPI, PostgreSQL (comma-separated)"
                                            value={techStackInput}
                                            onChange={(e) => setTechStackInput(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                        />
                                    </div>

                                    {/* Planning Mode */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-4">
                                            Planning Mode
                                        </label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all" style={{
                                                borderColor: formData.planning_mode === 'deadline' ? '#2563eb' : '#e5e7eb',
                                                backgroundColor: formData.planning_mode === 'deadline' ? '#eff6ff' : 'white'
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
                                                    className="w-4 h-4 text-blue-600"
                                                />
                                                <div className="ml-3">
                                                    <div className="font-semibold text-gray-900">Fixed Deadline</div>
                                                    <div className="text-sm text-gray-500">I have a specific end date</div>
                                                </div>
                                            </label>

                                            <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all" style={{
                                                borderColor: formData.planning_mode === 'open' ? '#2563eb' : '#e5e7eb',
                                                backgroundColor: formData.planning_mode === 'open' ? '#eff6ff' : 'white'
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
                                                    className="w-4 h-4 text-blue-600"
                                                />
                                                <div className="ml-3">
                                                    <div className="font-semibold text-gray-900">Flexible Timeline</div>
                                                    <div className="text-sm text-gray-500">No fixed deadline</div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Conditional: Deadline date */}
                                    {formData.planning_mode === 'deadline' && (
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Target Deadline
                                            </label>
                                            <Input
                                                type="date"
                                                value={formData.deadline_date || ''}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        deadline_date: e.target.value,
                                                    }))
                                                }
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                            />
                                        </div>
                                    )}

                                    {/* Working Hours */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Working Hours Per Day
                                        </label>
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
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                        />
                                        <p className="text-sm text-gray-500 mt-2">How many hours per day can you dedicate to this project?</p>
                                    </div>

                                    {/* Error Message */}
                                    {createError && (
                                        <Alert className="border-2 border-red-200 bg-red-50">
                                            <AlertCircle className="h-4 w-4 text-red-600" />
                                            <AlertDescription className="text-red-800">{createError}</AlertDescription>
                                        </Alert>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-4 pt-4">
                                        <Button
                                            onClick={handleCreateProject}
                                            disabled={isCreating}
                                            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 rounded-lg transition-all"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Upcoming Deadlines Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-1 h-8 bg-blue-600 rounded"></div>
                            <h2 className="text-2xl font-bold text-gray-900">Upcoming Deadlines</h2>
                        </div>

                        {deadlinesLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                            </div>
                        ) : deadlines.length === 0 ? (
                            <Card className="border-2 border-dashed border-blue-300 bg-blue-50 p-12 text-center">
                                <Calendar className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                                <p className="text-gray-700 font-medium">No upcoming deadlines</p>
                                <p className="text-gray-500 text-sm mt-1">Start a project above to begin planning!</p>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {deadlines.map((d) => (
                                    <Card
                                        key={d.task_id}
                                        className="border-2 border-blue-200 bg-white p-6 hover:shadow-lg transition-shadow cursor-pointer group"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                                    {d.project_title}
                                                </h3>
                                                <p className="text-gray-600 text-sm mt-1 truncate">{d.task_title}</p>
                                            </div>
                                            <div className="flex items-center gap-3 flex-shrink-0">
                                                <div className="text-right">
                                                    <div className="flex items-center gap-1 text-gray-700 font-medium text-sm">
                                                        <Calendar size={16} className="text-blue-600" />
                                                        {d.deadline}
                                                    </div>
                                                    <div className="mt-2">
                                                        <span
                                                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${d.status === 'completed'
                                                                ? 'bg-green-100 text-green-700'
                                                                : d.status === 'in-progress'
                                                                    ? 'bg-blue-100 text-blue-700'
                                                                    : 'bg-yellow-100 text-yellow-700'
                                                                }`}
                                                        >
                                                            {d.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <ChevronRight className="text-gray-400 group-hover:text-blue-600 transition-colors" size={20} />
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
