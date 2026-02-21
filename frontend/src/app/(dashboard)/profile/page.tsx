'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import { User, Mail, Code, Clock, Zap, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';

export default function ProfilePage() {
    const { user, refreshUser } = useAuth();
    const displayName = user?.full_name && user.full_name !== 'string' ? user.full_name : 'Developer';

    const [fullName, setFullName] = useState(user?.full_name || '');
    const [skillLevel, setSkillLevel] = useState(user?.skill_level || 'medium');
    const [hoursPerDay, setHoursPerDay] = useState(user?.available_hours_per_day || 6);
    const [pace, setPace] = useState(user?.preferred_pace || 'medium');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSave = async () => {
        setSaving(true);
        setMessage('');
        setError('');

        try {
            await api.patch('/api/auth/me', {
                full_name: fullName,
                skill_level: skillLevel,
                available_hours_per_day: hoursPerDay,
                preferred_pace: pace,
            });
            await refreshUser();
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 5000);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const skillLevelDescriptions = {
        junior: 'Less than 2 years of professional experience',
        medium: '2-5 years of professional experience',
        senior: '5+ years of professional experience',
    };

    const paceDescriptions = {
        relaxed: 'Comfortable with slower, steady progress',
        medium: 'Balanced approach to development pace',
        aggressive: 'Prefer fast-paced, intensive development',
    };

    return (
        <div className="min-h-screen text-white">
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
            </div>

            <div className="relative z-10">
                <div className="rounded-2xl border border-white/20 bg-white/10 px-6 py-10 shadow-2xl backdrop-blur-xl md:px-12">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
                                <User size={32} className="text-cyan-200" />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold">Profile Settings</h1>
                                <p className="mt-1 text-sm text-slate-200/80">Manage your account and preferences, {displayName}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-6 py-12 md:px-12">
                    <Card className="mb-8 rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl">
                        <p className="text-sm leading-relaxed text-slate-200/85">
                            <span className="font-semibold text-white">These settings influence how the AI generates your project roadmaps.</span> Your skill level, available hours, and preferred pace help create personalized timelines and task breakdowns.
                        </p>
                    </Card>

                    <Card className="mb-8 rounded-xl border border-white/20 bg-white/10 p-8 backdrop-blur-xl">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20">
                                <Mail className="text-cyan-200" size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <Label className="mb-2 block text-sm font-semibold text-slate-100">Email Address</Label>
                                <p className="break-all font-medium text-white">{user?.email}</p>
                                <p className="mt-2 text-xs text-slate-300">Email cannot be changed</p>
                            </div>
                        </div>
                    </Card>

                    <div className="space-y-8">
                        <Card className="rounded-xl border border-white/20 bg-white/10 p-8 backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.12]">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20">
                                    <User className="text-cyan-200" size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <Label className="mb-3 block text-sm font-semibold text-slate-100">Full Name</Label>
                                    <Input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Enter your full name"
                                        className="w-full border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-slate-300/60 focus-visible:ring-white/50"
                                    />
                                </div>
                            </div>
                        </Card>

                        <Card className="rounded-xl border border-white/20 bg-white/10 p-8 backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.12]">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20">
                                    <Code className="text-cyan-200" size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <Label className="mb-3 block text-sm font-semibold text-slate-100">Skill Level</Label>
                                    <select
                                        value={skillLevel}
                                        onChange={(e) => setSkillLevel(e.target.value as 'junior' | 'medium' | 'senior')}
                                        className="w-full rounded-md border border-white/20 bg-white/5 px-4 py-3 font-medium text-white transition-all focus:outline-none focus:ring-1 focus:ring-white/50"
                                    >
                                        <option value="junior" className="bg-slate-900 text-white">Junior</option>
                                        <option value="medium" className="bg-slate-900 text-white">Medium</option>
                                        <option value="senior" className="bg-slate-900 text-white">Senior</option>
                                    </select>
                                    <p className="mt-3 rounded-lg border border-white/20 bg-white/5 p-3 text-sm text-slate-300">
                                        {skillLevelDescriptions[skillLevel as 'junior' | 'medium' | 'senior']}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card className="rounded-xl border border-white/20 bg-white/10 p-8 backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.12]">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20">
                                    <Clock className="text-cyan-200" size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <Label className="mb-3 block text-sm font-semibold text-slate-100">
                                        Available Hours Per Day
                                    </Label>
                                    <div className="flex items-center gap-4">
                                        <Input
                                            type="number"
                                            min={0.5}
                                            max={24}
                                            step={0.5}
                                            value={hoursPerDay}
                                            onChange={(e) => setHoursPerDay(Number(e.target.value))}
                                            className="flex-1 border-white/20 bg-white/5 px-4 py-3 text-white focus-visible:ring-white/50"
                                        />
                                        <span className="whitespace-nowrap font-semibold text-slate-200">hours/day</span>
                                    </div>
                                    <p className="mt-3 text-sm text-slate-300">
                                        How many hours can you dedicate to projects daily? This helps us create realistic timelines.
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card className="rounded-xl border border-white/20 bg-white/10 p-8 backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.12]">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20">
                                    <Zap className="text-cyan-200" size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <Label className="mb-4 block text-sm font-semibold text-slate-100">Preferred Development Pace</Label>

                                    <div className="space-y-3">
                                        {(['relaxed', 'medium', 'aggressive'] as const).map((paceOption) => (
                                            <label
                                                key={paceOption}
                                                className="flex cursor-pointer items-center rounded-lg border-2 p-4 transition-all"
                                                style={{
                                                    borderColor: pace === paceOption ? 'rgba(103,232,249,0.5)' : 'rgba(255,255,255,0.2)',
                                                    backgroundColor: pace === paceOption ? 'rgba(34,211,238,0.12)' : 'rgba(255,255,255,0.05)',
                                                }}
                                            >
                                                <input
                                                    type="radio"
                                                    name="pace"
                                                    value={paceOption}
                                                    checked={pace === paceOption}
                                                    onChange={(e) => setPace(e.target.value as 'relaxed' | 'medium' | 'aggressive')}
                                                    className="h-4 w-4 cursor-pointer accent-cyan-300"
                                                />
                                                <div className="ml-3 flex-1">
                                                    <div className="font-semibold capitalize text-white">{paceOption}</div>
                                                    <div className="text-sm text-slate-300">{paceDescriptions[paceOption]}</div>
                                                </div>
                                                {pace === paceOption && <Check size={20} className="flex-shrink-0 text-cyan-200" />}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {message && (
                        <Alert className="mt-8 border-emerald-300/40 bg-emerald-500/10 text-emerald-50">
                            <Check className="h-4 w-4 text-emerald-200" />
                            <AlertDescription className="font-medium text-emerald-100">{message}</AlertDescription>
                        </Alert>
                    )}

                    {error && (
                        <Alert className="mt-8 border-red-300/40 bg-red-500/10 text-red-50">
                            <AlertCircle className="h-4 w-4 text-red-200" />
                            <AlertDescription className="font-medium text-red-100">{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="mt-10">
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full rounded-xl bg-gradient-to-r from-indigo-500/90 to-cyan-400/90 py-4 text-lg font-semibold text-white transition-all duration-300 hover:scale-[1.01] hover:from-indigo-500 hover:to-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Saving Changes...
                                </>
                            ) : (
                                <>
                                    <Check size={20} />
                                    Save Profile
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
