import api from "./axios";
import {
    CreateProjectRequest,
    UpdateTaskStatusRequest,
    Project,
    ProjectWithRoadmap,
    DeadlineItem,
} from "@/types/project";

// ──────────────────────────────────────────────
// Project API Functions
// All calls go through the axios instance (auto JWT + refresh)
// ──────────────────────────────────────────────

/**
 * Create a new project and generate a roadmap via Gemini LLM.
 * Returns the full project with modules and tasks.
 */
export async function createProject(
    data: CreateProjectRequest
): Promise<ProjectWithRoadmap> {
    const response = await api.post("/api/projects", data);
    return response.data;
}

/**
 * List all projects for the authenticated user.
 * Returns project summaries (no modules/tasks).
 */
export async function getProjects(): Promise<Project[]> {
    const response = await api.get("/api/projects");
    return response.data;
}

/**
 * Get full project detail with all modules and tasks.
 */
export async function getProjectDetail(
    projectId: string
): Promise<ProjectWithRoadmap> {
    const response = await api.get(`/api/projects/${projectId}`);
    return response.data;
}

/**
 * Update a task's status (pending, in_progress, completed, blocked).
 */
export async function updateTaskStatus(
    projectId: string,
    taskId: string,
    data: UpdateTaskStatusRequest
): Promise<void> {
    await api.patch(`/api/projects/${projectId}/tasks/${taskId}`, data);
}

/**
 * Get upcoming task deadlines across all projects.
 */
export async function getUpcomingDeadlines(): Promise<DeadlineItem[]> {
    const response = await api.get("/api/projects/deadlines");
    return response.data;
}

/**
 * Delete a project and all its modules/tasks.
 */
export async function deleteProject(projectId: string): Promise<void> {
    await api.delete(`/api/projects/${projectId}`);
}
