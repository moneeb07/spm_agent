// ──────────────────────────────────────────────
// Project TypeScript Interfaces
// Mirror the backend Pydantic schemas
// ──────────────────────────────────────────────

export type PlanningMode = "deadline" | "open";
export type ProjectStatus = "planning" | "active" | "completed" | "archived";
export type TaskStatus = "pending" | "in_progress" | "completed" | "blocked";

export interface CreateProjectRequest {
    title: string;
    description: string;
    tech_stack: string[];
    planning_mode: PlanningMode;
    deadline_date?: string; // ISO date string "YYYY-MM-DD"
    working_hours_per_day: number;
}

export interface UpdateTaskStatusRequest {
    status: TaskStatus;
}

export interface Task {
    id: string;
    module_id: string;
    project_id: string;
    title: string;
    description?: string;
    order_index: number;
    status: TaskStatus;
    estimated_hours?: number;
    deadline?: string;
    completed_at?: string;
    created_at?: string;
}

export interface Module {
    id: string;
    project_id: string;
    title: string;
    description?: string;
    order_index: number;
    status: string;
    estimated_days?: number;
    start_date?: string;
    end_date?: string;
    tasks: Task[];
    created_at?: string;
}

export interface Project {
    id: string;
    user_id: string;
    title: string;
    description: string;
    tech_stack: string[];
    planning_mode: PlanningMode;
    deadline_date?: string;
    working_hours_per_day?: number;
    status: ProjectStatus;
    created_at?: string;
    updated_at?: string;
}

export interface ProjectWithRoadmap extends Project {
    modules: Module[];
}

export interface DeadlineItem {
    project_id: string;
    project_title: string;
    task_id: string;
    task_title: string;
    deadline: string;
    status: string;
}
