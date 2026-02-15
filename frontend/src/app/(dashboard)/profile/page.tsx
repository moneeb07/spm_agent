"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";

/*
 * ═══════════════════════════════════════════════
 * PROFILE PAGE — Design this with Tailwind CSS
 * ═══════════════════════════════════════════════
 *
 * Shows the user's profile info and lets them edit it.
 *
 * FIELDS:
 *   - Full Name (text input)
 *   - Email (read-only, displayed)
 *   - Skill Level (select: junior / medium / senior)
 *   - Available Hours Per Day (number input)
 *   - Preferred Pace (select: relaxed / medium / aggressive)
 *
 * BEHAVIOR:
 *   - Pre-fill fields from user (via useAuth)
 *   - On submit: PATCH /api/auth/me with updated fields
 *   - Show success/error messages
 *   - After success, call refreshUser() to update context
 *
 * NOTE:
 *   Skill level, hours, and pace are used by the LLM
 *   when generating project roadmaps. Updating these
 *   affects future project planning quality.
 * ═══════════════════════════════════════════════
 */

export default function ProfilePage() {
    const { user, refreshUser } = useAuth();

    const [fullName, setFullName] = useState(user?.full_name || "");
    const [skillLevel, setSkillLevel] = useState(user?.skill_level || "medium");
    const [hoursPerDay, setHoursPerDay] = useState(
        user?.available_hours_per_day || 6
    );
    const [pace, setPace] = useState(user?.preferred_pace || "medium");
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSave = async () => {
        setSaving(true);
        setMessage("");
        setError("");

        try {
            await api.patch("/api/auth/me", {
                full_name: fullName,
                skill_level: skillLevel,
                available_hours_per_day: hoursPerDay,
                preferred_pace: pace,
            });
            await refreshUser();
            setMessage("Profile updated successfully!");
        } catch (err: any) {
            setError(
                err.response?.data?.detail || "Failed to update profile."
            );
        } finally {
            setSaving(false);
        }
    };

    // ─────────────────────────────────────────
    // YOUR TAILWIND DESIGN GOES BELOW
    // Use: fullName, skillLevel, hoursPerDay, pace, saving, message, error, handleSave
    // ─────────────────────────────────────────

    return (
        <div>
            <h1>Profile Settings</h1>
            <p>
                These settings influence how the AI generates your project
                roadmaps.
            </p>

            {/* Email (read-only) */}
            <div>
                <label>Email</label>
                <p>{user?.email}</p>
            </div>

            {/* Full Name */}
            <div>
                <label>Full Name</label>
                <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                />
            </div>

            {/* Skill Level */}
            <div>
                <label>Skill Level</label>
                <select
                    value={skillLevel}
                    onChange={(e) => setSkillLevel(e.target.value as "junior" | "medium" | "senior")}

                >
                    <option value="junior">Junior</option>
                    <option value="medium">Medium</option>
                    <option value="senior">Senior</option>
                </select>
            </div>

            {/* Hours Per Day */}
            <div>
                <label>Available Hours Per Day</label>
                <input
                    type="number"
                    min={0.5}
                    max={24}
                    step={0.5}
                    value={hoursPerDay}
                    onChange={(e) => setHoursPerDay(Number(e.target.value))}
                />
            </div>

            {/* Preferred Pace */}
            <div>
                <label>Preferred Pace</label>
                <select value={pace} onChange={(e) => setPace(e.target.value as "relaxed" | "medium" | "aggressive")}>
                    <option value="relaxed">Relaxed</option>
                    <option value="medium">Medium</option>
                    <option value="aggressive">Aggressive</option>
                </select>
            </div>

            {/* Messages */}
            {message && <p style={{ color: "green" }}>{message}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {/* Save Button */}
            <button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Profile"}
            </button>
        </div>
    );
}
