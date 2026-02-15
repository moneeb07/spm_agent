"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { createProject, getUpcomingDeadlines } from "@/lib/projectApi";
import { CreateProjectRequest, DeadlineItem, PlanningMode } from "@/types/project";
import { useRouter } from "next/navigation";

/*
 * ═══════════════════════════════════════════════
 * DASHBOARD PAGE — Design this with Tailwind CSS
 * ═══════════════════════════════════════════════
 *
 * This is the main landing page after login.
 * It has TWO main sections:
 *
 * ── SECTION 1: START A NEW PROJECT ──
 *   A form/wizard to create a new project:
 *   Step 1: Enter project description (textarea) + click "Start Project"
 *   Step 2: Project initialization requirements appear:
 *     - title (text input)
 *     - tech_stack (comma-separated or tag input)
 *     - planning_mode (radio: "deadline" or "open")
 *     - IF deadline: deadline_date (date input) + working_hours_per_day (number)
 *     - IF open: working_hours_per_day (number)
 *     - Submit button → calls createProject() → navigates to project detail
 *
 * ── SECTION 2: UPCOMING DEADLINES ──
 *   A list of upcoming task deadlines across ALL projects.
 *   Shows: project name, task name, deadline date, status badge.
 *   If empty: "No upcoming deadlines" message.
 *
 * STATE:
 *   - showWizard: boolean — toggles the project creation wizard
 *   - formData: CreateProjectRequest — the form fields
 *   - deadlines: DeadlineItem[] — fetched on page load
 *   - loading/error states for both
 *
 * AVAILABLE DATA:
 *   - user (from useAuth): full_name, email, etc.
 *   - deadlines (fetched from API)
 * ═══════════════════════════════════════════════
 */

export default function DashboardPage() {
    const { user } = useAuth();
    const router = useRouter();

    // ─── Project Creation State ─────────────────
    const [showWizard, setShowWizard] = useState(false);
    const [description, setDescription] = useState("");
    const [formData, setFormData] = useState<CreateProjectRequest>({
        title: "",
        description: "",
        tech_stack: [],
        planning_mode: "open",
        working_hours_per_day: 6,
    });
    const [techStackInput, setTechStackInput] = useState(""); // comma-separated string
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState("");

    // ─── Deadlines State ────────────────────────
    const [deadlines, setDeadlines] = useState<DeadlineItem[]>([]);
    const [deadlinesLoading, setDeadlinesLoading] = useState(true);

    // ─── Fetch Deadlines on Mount ───────────────
    useEffect(() => {
        async function fetchDeadlines() {
            try {
                const data = await getUpcomingDeadlines();
                setDeadlines(data);
            } catch {
                console.error("Failed to load deadlines");
            } finally {
                setDeadlinesLoading(false);
            }
        }
        fetchDeadlines();
    }, []);

    // ─── Handlers ───────────────────────────────

    // Step 1: User writes description and clicks "Start Project"
    const handleStartProject = () => {
        if (!description.trim()) return;
        setFormData((prev) => ({ ...prev, description: description.trim() }));
        setShowWizard(true);
    };

    // Step 2: User fills in details and submits
    const handleCreateProject = async () => {
        setCreateError("");
        setIsCreating(true);

        try {
            // Parse tech stack from comma string → array
            const techStack = techStackInput
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);

            const requestData: CreateProjectRequest = {
                ...formData,
                tech_stack: techStack,
            };

            const project = await createProject(requestData);

            // Navigate to the newly created project's detail page
            router.push(`/projects/${project.id}`);
        } catch (err: any) {
            console.log(err);
            setCreateError(
                err.response?.data?.detail || "Failed to create project. Try again."
            );
        } finally {
            setIsCreating(false);
        }
    };

    // ─────────────────────────────────────────
    // YOUR TAILWIND DESIGN GOES BELOW
    // Use: user, showWizard, description, formData, deadlines, handlers
    // ─────────────────────────────────────────

    return (
        <div>
            {/* 
        ═══════════════════════════════════════
        WELCOME HEADER
        ═══════════════════════════════════════
      */}
            <h1>Welcome back, {user?.full_name || "Developer"}!</h1>

            {/* 
        ═══════════════════════════════════════
        SECTION 1: START A NEW PROJECT
        ═══════════════════════════════════════
        
        When showWizard is FALSE:
          - Show a textarea for project description
          - Show a "Start Project" button
          
        When showWizard is TRUE:
          - Show the initialization form:
            * title (text input) → formData.title
            * tech_stack (text input, comma-separated) → techStackInput
            * planning_mode (radio buttons: "deadline" | "open") → formData.planning_mode
            * IF deadline: deadline_date (date input) → formData.deadline_date
            * working_hours_per_day (number input) → formData.working_hours_per_day
            * Submit button → handleCreateProject()
            * Cancel button → setShowWizard(false)
      */}

            {!showWizard ? (
                <div>
                    {/* Project description textarea */}
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your project idea... What are you building? What problem does it solve?"
                    />
                    <button onClick={handleStartProject}>Start Project</button>
                </div>
            ) : (
                <div>
                    {/* ── Project Initialization Form ── */}

                    {/* Title */}
                    <input
                        type="text"
                        placeholder="Project Title"
                        value={formData.title}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, title: e.target.value }))
                        }
                    />

                    {/* Description (pre-filled, editable) */}
                    <textarea
                        value={formData.description}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, description: e.target.value }))
                        }
                        placeholder="Project description"
                    />

                    {/* Tech Stack */}
                    <input
                        type="text"
                        placeholder="Tech stack (comma-separated): React, FastAPI, PostgreSQL"
                        value={techStackInput}
                        onChange={(e) => setTechStackInput(e.target.value)}
                    />

                    {/* Planning Mode */}
                    {/* 
            Design radio buttons or a toggle:
            - "Deadline" mode: I have a fixed deadline
            - "Open" mode: Flexible/no deadline 
          */}
                    <div>
                        <label>
                            <input
                                type="radio"
                                name="planningMode"
                                value="deadline"
                                checked={formData.planning_mode === "deadline"}
                                onChange={() =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        planning_mode: "deadline" as PlanningMode,
                                    }))
                                }
                            />
                            Deadline-based (I have a fixed end date)
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="planningMode"
                                value="open"
                                checked={formData.planning_mode === "open"}
                                onChange={() =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        planning_mode: "open" as PlanningMode,
                                    }))
                                }
                            />
                            Open-ended (flexible timeline)
                        </label>
                    </div>

                    {/* Conditional: Deadline date (only for deadline mode) */}
                    {formData.planning_mode === "deadline" && (
                        <input
                            type="date"
                            value={formData.deadline_date || ""}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    deadline_date: e.target.value,
                                }))
                            }
                        />
                    )}

                    {/* Working Hours Per Day */}
                    <input
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
                        placeholder="Working hours per day"
                    />

                    {/* Error message */}
                    {createError && <p style={{ color: "red" }}>{createError}</p>}

                    {/* Action buttons */}
                    <button onClick={handleCreateProject} disabled={isCreating}>
                        {isCreating ? "Generating Roadmap..." : "Generate Project Roadmap"}
                    </button>
                    <button onClick={() => setShowWizard(false)}>Cancel</button>
                </div>
            )}

            {/* 
        ═══════════════════════════════════════
        SECTION 2: UPCOMING DEADLINES
        ═══════════════════════════════════════
        
        Show a list/table of upcoming deadlines:
        Each item has:
          - deadline.project_title
          - deadline.task_title
          - deadline.deadline (format as readable date)
          - deadline.status (could be a colored badge)
          
        If deadlinesLoading: show skeleton/spinner
        If deadlines.length === 0: show "No upcoming deadlines" message
      */}

            <div>
                <h2>Upcoming Deadlines</h2>
                {deadlinesLoading ? (
                    <p>Loading...</p>
                ) : deadlines.length === 0 ? (
                    <p>No upcoming deadlines. Start a project above!</p>
                ) : (
                    <ul>
                        {deadlines.map((d) => (
                            <li key={d.task_id}>
                                <strong>{d.project_title}</strong> — {d.task_title}
                                <span> | Due: {d.deadline}</span>
                                <span> | Status: {d.status}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
