from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime


# ──────────────────────────────────────────────
# Request Models
# ──────────────────────────────────────────────

class CreateProjectRequest(BaseModel):
    """Request body to create a new project and generate a roadmap via LLM."""
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=10, description="Detailed project description")
    tech_stack: List[str] = Field(default_factory=list, description="e.g. ['React', 'FastAPI', 'PostgreSQL']")
    planning_mode: str = Field(..., pattern="^(deadline|open)$", description="'deadline' = fixed end date, 'open' = flexible")
    deadline_date: Optional[date] = Field(None, description="Required if planning_mode is 'deadline'")
    working_hours_per_day: float = Field(default=6, ge=1, le=16)


class UpdateTaskStatusRequest(BaseModel):
    """Request body to update a task's status."""
    status: str = Field(..., pattern="^(pending|in_progress|completed|blocked)$")


# ──────────────────────────────────────────────
# Response Models
# ──────────────────────────────────────────────

class TaskResponse(BaseModel):
    """A single task within a module."""
    id: str
    module_id: str
    project_id: str
    title: str
    description: Optional[str] = None
    order_index: int
    status: str
    estimated_hours: Optional[float] = None
    deadline: Optional[date] = None
    completed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None


class ModuleResponse(BaseModel):
    """A module (phase) within a project, includes its tasks."""
    id: str
    project_id: str
    title: str
    description: Optional[str] = None
    order_index: int
    status: str
    estimated_days: Optional[float] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    tasks: List[TaskResponse] = []
    created_at: Optional[datetime] = None


class ProjectResponse(BaseModel):
    """Project summary (used in list views — no modules/tasks)."""
    id: str
    user_id: str
    title: str
    description: str
    tech_stack: List[str] = []
    planning_mode: str
    deadline_date: Optional[date] = None
    working_hours_per_day: Optional[float] = None
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class ProjectWithRoadmap(ProjectResponse):
    """Full project detail with modules and tasks (used in detail view)."""
    modules: List[ModuleResponse] = []


class DeadlineItem(BaseModel):
    """A single upcoming deadline (task or module)."""
    project_id: str
    project_title: str
    task_id: str
    task_title: str
    deadline: date
    status: str
