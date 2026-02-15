from fastapi import APIRouter, Depends, status
from app.dependencies import get_current_user
from app.schemas.project import (
    CreateProjectRequest,
    UpdateTaskStatusRequest,
    ProjectResponse,
    ProjectWithRoadmap,
    DeadlineItem,
)
from app.schemas.auth import MessageResponse
from app.services.project_service import ProjectService
from app.supabase_client import supabase


router = APIRouter(prefix="/api/projects", tags=["Projects"])


# ──────────────────────────────────────────────
# POST /api/projects — Create project + generate roadmap
# ──────────────────────────────────────────────
@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    summary="Create a new project and generate a roadmap via Gemini LLM",
)
async def create_project(
    data: CreateProjectRequest,
    user: dict = Depends(get_current_user),
):
    """
    Creates a project, calls Gemini to generate a roadmap,
    saves modules + tasks to DB, and returns the full project.
    """
    # Fetch user profile for skill_level and preferred_pace
    try:
        profile_response = (
            supabase.table("profiles")
            .select("skill_level, preferred_pace")
            .eq("id", user["sub"])
            .single()
            .execute()
        )
        user_profile = profile_response.data or {}
    except Exception:
        user_profile = {}

    project = await ProjectService.create_project(
        user_id=user["sub"],
        data=data,
        user_profile=user_profile,
    )
    return project

# ──────────────────────────────────────────────
# GET /api/projects — List all projects
# ──────────────────────────────────────────────
@router.get(
    "",
    response_model=list[ProjectResponse],
    summary="List all projects for the authenticated user",
)
def list_projects(user: dict = Depends(get_current_user)):
    return ProjectService.get_projects(user_id=user["sub"])


# ──────────────────────────────────────────────
# GET /api/projects/deadlines — Upcoming deadlines
# ──────────────────────────────────────────────
@router.get(
    "/deadlines",
    response_model=list[DeadlineItem],
    summary="Get upcoming task deadlines across all projects",
)
def get_deadlines(user: dict = Depends(get_current_user)):
    return ProjectService.get_upcoming_deadlines(user_id=user["sub"])


# ──────────────────────────────────────────────
# GET /api/projects/{id} — Project detail
# ──────────────────────────────────────────────
@router.get(
    "/{project_id}",
    response_model=ProjectWithRoadmap,
    summary="Get full project detail with modules and tasks",
)
def get_project(project_id: str, user: dict = Depends(get_current_user)):
    return ProjectService.get_project_detail(
        project_id=project_id, user_id=user["sub"]
    )


# ──────────────────────────────────────────────
# PATCH /api/projects/{id}/tasks/{task_id} — Update task status
# ──────────────────────────────────────────────
@router.patch(
    "/{project_id}/tasks/{task_id}",
    summary="Update a task's status",
)
def update_task(
    project_id: str,
    task_id: str,
    data: UpdateTaskStatusRequest,
    user: dict = Depends(get_current_user),
):
    return ProjectService.update_task_status(
        task_id=task_id,
        project_id=project_id,
        user_id=user["sub"],
        new_status=data.status,
    )


# ──────────────────────────────────────────────
# DELETE /api/projects/{id} — Delete project
# ──────────────────────────────────────────────
@router.delete(
    "/{project_id}",
    response_model=MessageResponse,
    summary="Delete a project and all its modules/tasks",
)
def delete_project(project_id: str, user: dict = Depends(get_current_user)):
    return ProjectService.delete_project(
        project_id=project_id, user_id=user["sub"]
    )
