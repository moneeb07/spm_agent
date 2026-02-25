from fastapi import APIRouter, Depends, status, Request
from fastapi.responses import StreamingResponse
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
from app.services.llm_service import LLMService
from app.supabase_client import supabase
import json


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
# POST /api/projects/stream — Create project with SSE streaming
# ──────────────────────────────────────────────
@router.post(
    "/stream",
    summary="Create project with streaming LLM output via SSE",
)
async def create_project_stream(
    data: CreateProjectRequest,
    user: dict = Depends(get_current_user),
):
    """
    Same as create_project but returns a Server-Sent Events stream.
    Events: status, chunk (raw LLM text), done (project_id), error.
    """
    from datetime import date

    # Validate deadline mode
    if data.planning_mode == "deadline" and not data.deadline_date:
        return StreamingResponse(
            iter([f"data: {json.dumps({'type': 'error', 'data': 'deadline_date is required when planning_mode is deadline.'})}\n\n"]),
            media_type="text/event-stream",
        )

    if data.planning_mode == "deadline" and data.deadline_date:
        if data.deadline_date <= date.today():
            return StreamingResponse(
                iter([f"data: {json.dumps({'type': 'error', 'data': 'deadline_date must be in the future.'})}\n\n"]),
                media_type="text/event-stream",
            )

    # Fetch user profile
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

    # Insert project into DB first
    project_insert = {
        "user_id": user["sub"],
        "title": data.title,
        "description": data.description,
        "tech_stack": data.tech_stack,
        "planning_mode": data.planning_mode,
        "deadline_date": str(data.deadline_date) if data.deadline_date else None,
        "working_hours_per_day": data.working_hours_per_day,
        "status": "planning",
    }

    try:
        project_response = (
            supabase.table("projects").insert(project_insert).execute()
        )
        project = project_response.data[0]
    except Exception as e:
        return StreamingResponse(
            iter([f"data: {json.dumps({'type': 'error', 'data': f'Failed to create project: {str(e)}'})}\n\n"]),
            media_type="text/event-stream",
        )

    project_id = project["id"]

    async def event_generator():
        roadmap = None

        async for event_type, event_data in LLMService.generate_roadmap_stream(
            description=data.description,
            tech_stack=data.tech_stack,
            planning_mode=data.planning_mode,
            deadline_date=str(data.deadline_date) if data.deadline_date else None,
            working_hours_per_day=data.working_hours_per_day,
            skill_level=user_profile.get("skill_level"),
            preferred_pace=user_profile.get("preferred_pace"),
        ):
            if event_type == "status":
                yield f"data: {json.dumps({'type': 'status', 'data': event_data})}\n\n"

            elif event_type == "chunk":
                yield f"data: {json.dumps({'type': 'chunk', 'data': event_data})}\n\n"

            elif event_type == "error":
                yield f"data: {json.dumps({'type': 'error', 'data': event_data})}\n\n"
                return

            elif event_type == "done":
                roadmap = event_data

        if roadmap is None:
            yield f"data: {json.dumps({'type': 'error', 'data': 'No roadmap generated.'})}\n\n"
            return

        # Save roadmap to DB
        try:
            supabase.table("projects").update(
                {"llm_raw_response": roadmap, "status": "active"}
            ).eq("id", project_id).execute()

            modules_data = roadmap.get("modules", [])
            for i, module_data in enumerate(modules_data):
                mod_title = module_data.get("title", "Untitled")
                status_msg = f"💾 Saving Module {i + 1}: {mod_title}..."
                yield f"data: {json.dumps({'type': 'status', 'data': status_msg})}\n\n"

                module_insert = {
                    "project_id": project_id,
                    "title": module_data["title"],
                    "description": module_data.get("description", ""),
                    "order_index": module_data.get("order_index", 0),
                    "estimated_days": module_data.get("estimated_days"),
                    "start_date": module_data.get("start_date"),
                    "end_date": module_data.get("end_date"),
                    "status": "pending",
                }

                module_response = (
                    supabase.table("modules").insert(module_insert).execute()
                )
                module = module_response.data[0]

                tasks = module_data.get("tasks", [])
                for task_data in tasks:
                    task_insert = {
                        "module_id": module["id"],
                        "project_id": project_id,
                        "title": task_data["title"],
                        "description": task_data.get("description", ""),
                        "order_index": task_data.get("order_index", 0),
                        "estimated_hours": task_data.get("estimated_hours"),
                        "deadline": task_data.get("deadline"),
                        "status": "pending",
                    }
                    supabase.table("tasks").insert(task_insert).execute()

            yield f"data: {json.dumps({'type': 'status', 'data': '✅ Roadmap saved successfully!'})}\n\n"
            yield f"data: {json.dumps({'type': 'done', 'data': project_id})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'data': f'Failed to save roadmap: {str(e)}'})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )

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
