"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getProjectDetail, updateTaskStatus } from "@/lib/projectApi";
import { ProjectWithRoadmap, TaskStatus } from "@/types/project";

/*
 * ═══════════════════════════════════════════════
 * PROJECT DETAIL PAGE — Design this with Tailwind CSS
 * ═══════════════════════════════════════════════
 *
 * Shows a single project's full roadmap:
 *   - Project header (title, description, status, mode, deadline)
 *   - List of Modules (expandable/collapsible sections)
 *   - Each Module contains Tasks with status toggles
 *
 * EACH MODULE SHOWS:
 *   - module.title + module.description
 *   - module.estimated_days
 *   - module.start_date → module.end_date (date range)
 *   - module.status (badge)
 *   - List of tasks inside it
 *
 * EACH TASK SHOWS:
 *   - task.title + task.description
 *   - task.estimated_hours
 *   - task.deadline
 *   - task.status (dropdown or button to change)
 *     → calls handleTaskStatusChange()
 *
 * DESIGN SUGGESTIONS:
 *   - Accordion/collapsible modules
 *   - Task status as dropdown or toggle buttons
 *   - Progress bar per module (completed / total tasks)
 *   - Color-coded status badges
 * ═══════════════════════════════════════════════
 */

export default function ProjectDetailPage() {
    const params = useParams();
    const projectId = params.id as string;

    const [project, setProject] = useState<ProjectWithRoadmap | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchProject() {
            try {
                const data = await getProjectDetail(projectId);
                setProject(data);
            } catch {
                setError("Failed to load project.");
            } finally {
                setLoading(false);
            }
        }
        if (projectId) fetchProject();
    }, [projectId]);

    // Handler: update a task's status
    const handleTaskStatusChange = async (
        taskId: string,
        newStatus: TaskStatus
    ) => {
        try {
            await updateTaskStatus(projectId, taskId, { status: newStatus });

            // Update local state so UI reflects the change immediately
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
            alert("Failed to update task status.");
        }
    };

    // ─────────────────────────────────────────
    // YOUR TAILWIND DESIGN GOES BELOW
    // Use: project, loading, error, handleTaskStatusChange
    // ─────────────────────────────────────────

    if (loading) return <p>Loading project...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (!project) return <p>Project not found.</p>;

    return (
        <div>
            {/* 
        ═══════════════════════════════════
        PROJECT HEADER
        ═══════════════════════════════════
      */}
            <h1>{project.title}</h1>
            <p>{project.description}</p>
            <span>Status: {project.status}</span>
            <span> | Mode: {project.planning_mode}</span>
            {project.deadline_date && (
                <span> | Deadline: {project.deadline_date}</span>
            )}

            {/* 
        ═══════════════════════════════════
        MODULES + TASKS
        ═══════════════════════════════════
        
        Map over project.modules → for each module, show its tasks.
        
        Status options for the <select>:
        - pending
        - in_progress
        - completed
        - blocked
      */}
            {project.modules.map((module) => (
                <div key={module.id}>
                    <h2>
                        {module.order_index + 1}. {module.title}
                    </h2>
                    <p>{module.description}</p>
                    <p>
                        {module.estimated_days} days | {module.start_date} → {module.end_date}
                    </p>

                    {/* Tasks */}
                    <ul>
                        {module.tasks.map((task) => (
                            <li key={task.id}>
                                <span>{task.title}</span>
                                <span> ({task.estimated_hours}h)</span>
                                {task.deadline && <span> | Due: {task.deadline}</span>}

                                {/* Status dropdown */}
                                <select
                                    value={task.status}
                                    onChange={(e) =>
                                        handleTaskStatusChange(
                                            task.id,
                                            e.target.value as TaskStatus
                                        )
                                    }
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="blocked">Blocked</option>
                                </select>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}
