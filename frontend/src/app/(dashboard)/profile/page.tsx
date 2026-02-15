'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import { User, Mail, Code, Clock, Zap, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ProfilePage() {
    const { user, refreshUser } = useAuth();

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
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                <User size={32} />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold">Profile Settings</h1>
                                <p className="text-blue-100 text-sm mt-1">Manage your account and preferences</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Container */}
                <div className="max-w-4xl mx-auto px-6 py-12 md:px-12">
                    {/* Info Card */}
                    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 mb-8 rounded-xl">
                        <p className="text-gray-700 text-sm leading-relaxed">
                            <span className="font-semibold text-gray-900">These settings influence how the AI generates your project roadmaps.</span> Your skill level, available hours, and preferred pace help create personalized timelines and task breakdowns.
                        </p>
                    </Card>

                    {/* Email Section */}
                    <Card className="border-2 border-blue-200 bg-white p-8 mb-8 rounded-xl">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Mail className="text-blue-600" size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                <p className="text-gray-900 font-medium break-all">{user?.email}</p>
                                <p className="text-gray-500 text-xs mt-2">Email cannot be changed</p>
                            </div>
                        </div>
                    </Card>

                    {/* Form Sections */}
                    <div className="space-y-8">
                        {/* Full Name */}
                        <Card className="border-2 border-blue-200 bg-white p-8 rounded-xl hover:shadow-lg transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <User className="text-blue-600" size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">Full Name</label>
                                    <Input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Enter your full name"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Skill Level */}
                        <Card className="border-2 border-blue-200 bg-white p-8 rounded-xl hover:shadow-lg transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Code className="text-blue-600" size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">Skill Level</label>
                                    <select
                                        value={skillLevel}
                                        onChange={(e) => setSkillLevel(e.target.value as 'junior' | 'medium' | 'senior')}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white font-medium text-gray-900 transition-all"
                                    >
                                        <option value="junior">Junior</option>
                                        <option value="medium">Medium</option>
                                        <option value="senior">Senior</option>
                                    </select>
                                    <p className="text-gray-500 text-sm mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        {skillLevelDescriptions[skillLevel as 'junior' | 'medium' | 'senior']}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* Hours Per Day */}
                        <Card className="border-2 border-blue-200 bg-white p-8 rounded-xl hover:shadow-lg transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Clock className="text-blue-600" size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Available Hours Per Day
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <Input
                                            type="number"
                                            min={0.5}
                                            max={24}
                                            step={0.5}
                                            value={hoursPerDay}
                                            onChange={(e) => setHoursPerDay(Number(e.target.value))}
                                            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                        />
                                        <span className="text-gray-900 font-semibold whitespace-nowrap">hours/day</span>
                                    </div>
                                    <p className="text-gray-500 text-sm mt-3">
                                        How many hours can you dedicate to projects daily? This helps us create realistic timelines.
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* Preferred Pace */}
                        <Card className="border-2 border-blue-200 bg-white p-8 rounded-xl hover:shadow-lg transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Zap className="text-blue-600" size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <label className="block text-sm font-semibold text-gray-700 mb-4">Preferred Development Pace</label>

                                    <div className="space-y-3">
                                        {(['relaxed', 'medium', 'aggressive'] as const).map((paceOption) => (
                                            <label
                                                key={paceOption}
                                                className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-300"
                                                style={{
                                                    borderColor: pace === paceOption ? '#2563eb' : '#e5e7eb',
                                                    backgroundColor: pace === paceOption ? '#eff6ff' : 'white',
                                                }}
                                            >
                                                <input
                                                    type="radio"
                                                    name="pace"
                                                    value={paceOption}
                                                    checked={pace === paceOption}
                                                    onChange={(e) => setPace(e.target.value as 'relaxed' | 'medium' | 'aggressive')}
                                                    className="w-4 h-4 text-blue-600 cursor-pointer"
                                                />
                                                <div className="ml-3 flex-1">
                                                    <div className="font-semibold text-gray-900 capitalize">{paceOption}</div>
                                                    <div className="text-sm text-gray-500">{paceDescriptions[paceOption]}</div>
                                                </div>
                                                {pace === paceOption && <Check size={20} className="text-blue-600 flex-shrink-0" />}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Messages */}
                    {message && (
                        <Alert className="border-2 border-green-200 bg-green-50 mt-8 animate-in fade-in duration-300">
                            <Check className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800 font-medium">{message}</AlertDescription>
                        </Alert>
                    )}

                    {error && (
                        <Alert className="border-2 border-red-200 bg-red-50 mt-8 animate-in fade-in duration-300">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800 font-medium">{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Save Button */}
                    <div className="mt-10">
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold py-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                        >
                            {saving ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
