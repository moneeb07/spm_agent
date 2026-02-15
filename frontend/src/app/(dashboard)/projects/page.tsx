"use client";

import { useState, useEffect } from "react";
import { getProjects, deleteProject } from "@/lib/projectApi";
import { Project } from "@/types/project";
import Link from "next/link";

/*
 * ═══════════════════════════════════════════════
 * PROJECTS LIST PAGE — Design this with Tailwind CSS
 * ═══════════════════════════════════════════════
 *
 * Shows all user's projects as cards.
 * Clicking a card → navigates to /projects/[id].
 *
 * EACH PROJECT CARD SHOWS:
 *   - project.title
 *   - project.description (truncated to ~100 chars)
 *   - project.status (badge: planning / active / completed / archived)
 *   - project.planning_mode (badge: "deadline" or "open")
 *   - project.deadline_date (if deadline mode)
 *   - project.created_at (formatted date)
 *   - Delete button (optional — with confirmation)
 *
 * STATES:
 *   - loading: show skeleton cards
 *   - empty: "No projects yet. Go to Dashboard to create one."
 *   - error: show error message
 *
 * LAYOUT SUGGESTION:
 *   Grid of cards (2-3 columns on desktop, 1 on mobile)
 * ═══════════════════════════════════════════════
 */

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchProjects() {
            try {
                const data = await getProjects();
                setProjects(data);
            } catch {
                setError("Failed to load projects.");
            } finally {
                setLoading(false);
            }
        }
        fetchProjects();
    }, []);

    const handleDelete = async (projectId: string) => {
        if (!confirm("Are you sure you want to delete this project?")) return;
        try {
            await deleteProject(projectId);
            setProjects((prev) => prev.filter((p) => p.id !== projectId));
        } catch {
            alert("Failed to delete project.");
        }
    };

    // ─────────────────────────────────────────
    // YOUR TAILWIND DESIGN GOES BELOW
    // Use: projects, loading, error, handleDelete
    // ─────────────────────────────────────────

    return (
        <div>
            <h1>My Projects</h1>

            {loading && <p>Loading projects...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {!loading && projects.length === 0 && (
                <p>
                    No projects yet.{" "}
                    <Link href="/dashboard">Go to Dashboard</Link> to create one.
                </p>
            )}

            {/* 
        DESIGN YOUR PROJECT CARDS HERE
        
        Map over `projects` and render a card for each:
        
        projects.map((project) => (
          <Link href={`/projects/${project.id}`} key={project.id}>
            <div className="card">
              <h3>{project.title}</h3>
              <p>{project.description.substring(0, 100)}...</p>
              <span>Status: {project.status}</span>
              <span>Mode: {project.planning_mode}</span>
              {project.deadline_date && <span>Deadline: {project.deadline_date}</span>}
              <button onClick={(e) => { e.preventDefault(); handleDelete(project.id); }}>Delete</button>
            </div>
          </Link>
        ))
      */}

            <div>
                {projects.map((project) => (
                    <Link href={`/projects/${project.id}`} key={project.id}>
                        <div>
                            <h3>{project.title}</h3>
                            <p>{project.description.substring(0, 100)}...</p>
                            <span>Status: {project.status}</span>
                            <span> | Mode: {project.planning_mode}</span>
                            {project.deadline_date && (
                                <span> | Deadline: {project.deadline_date}</span>
                            )}
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleDelete(project.id);
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
