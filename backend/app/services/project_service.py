from fastapi import HTTPException, status
from app.supabase_client import supabase
from app.schemas.project import CreateProjectRequest
from app.services.llm_service import LLMService
from datetime import date


class ProjectService:
    """
    Handles all project-related business logic.
    CRUD operations on projects, modules, and tasks via Supabase.
    """

    # ── Create Project + Generate Roadmap ────────────
    @staticmethod
    async def create_project(user_id: str, data: CreateProjectRequest, user_profile: dict) -> dict:
        """
        1. Validate inputs (deadline mode must have deadline_date)
        2. Insert project into Supabase
        3. Call LLM to generate roadmap
        4. Save modules + tasks to Supabase
        5. Return the full project with roadmap
        """

        # Validate deadline mode
        if data.planning_mode == "deadline" and not data.deadline_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="deadline_date is required when planning_mode is 'deadline'.",
            )

        if data.planning_mode == "deadline" and data.deadline_date:
            if data.deadline_date <= date.today():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="deadline_date must be in the future.",
                )

        # Insert project
        project_insert = {
            "user_id": user_id,
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
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create project: {str(e)}",
            )
 
        # Generate roadmap via LLM
        try:
            roadmap = await LLMService.generate_roadmap(
                description=data.description,
                tech_stack=data.tech_stack,
                planning_mode=data.planning_mode,
                deadline_date=str(data.deadline_date) if data.deadline_date else None,
                working_hours_per_day=data.working_hours_per_day,
                skill_level=user_profile.get("skill_level"),
                preferred_pace=user_profile.get("preferred_pace"),
            )

            # Store raw LLM response for future reference
            supabase.table("projects").update(
                {"llm_raw_response": roadmap, "status": "active"}
            ).eq("id", project["id"]).execute()

            # Save modules + tasks into DB
            modules = await LLMService.save_roadmap_to_db(
                project_id=project["id"],
                roadmap=roadmap,
            )

            project["modules"] = modules
            project["status"] = "active"

        except HTTPException:
            # If LLM fails, project exists but has no roadmap — user can retry
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Roadmap generation failed: {str(e)}",
            )

        return project

    # ── List Projects ────────────────────────────────
    @staticmethod
    def get_projects(user_id: str) -> list[dict]:
        """Get all projects for a user (no modules/tasks, just summaries)."""
        try:
            response = (
                supabase.table("projects")
                .select("*")
                .eq("user_id", user_id)
                .order("created_at", desc=True)
                .execute()
            )
            return response.data
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch projects: {str(e)}",
            )

    # ── Get Project Detail ───────────────────────────
    @staticmethod
    def get_project_detail(project_id: str, user_id: str) -> dict:
        """Get a single project with all its modules and tasks."""
        try:
            # Fetch project
            project_response = (
                supabase.table("projects")
                .select("*")
                .eq("id", project_id)
                .eq("user_id", user_id)
                .single()
                .execute()
            )
            project = project_response.data
            if not project:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Project not found.",
                )

            # Fetch modules
            modules_response = (
                supabase.table("modules")
                .select("*")
                .eq("project_id", project_id)
                .order("order_index")
                .execute()
            )
            modules = modules_response.data

            # Fetch all tasks for this project
            tasks_response = (
                supabase.table("tasks")
                .select("*")
                .eq("project_id", project_id)
                .order("order_index")
                .execute()
            )
            all_tasks = tasks_response.data

            # Group tasks by module_id
            tasks_by_module = {}
            for task in all_tasks:
                mid = task["module_id"]
                if mid not in tasks_by_module:
                    tasks_by_module[mid] = []
                tasks_by_module[mid].append(task)

            # Attach tasks to their modules
            for module in modules:
                module["tasks"] = tasks_by_module.get(module["id"], [])

            project["modules"] = modules
            return project

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch project: {str(e)}",
            )

    # ── Update Task Status ───────────────────────────
    @staticmethod
    def update_task_status(task_id: str, project_id: str, user_id: str, new_status: str) -> dict:
        """Update a single task's status. Verifies ownership via project_id."""
        try:
            # Verify the project belongs to the user
            project_check = (
                supabase.table("projects")
                .select("id")
                .eq("id", project_id)
                .eq("user_id", user_id)
                .execute()
            )
            if not project_check.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Project not found.",
                )

            # Update the task
            update_data = {"status": new_status}
            if new_status == "completed":
                from datetime import datetime
                update_data["completed_at"] = datetime.utcnow().isoformat()

            response = (
                supabase.table("tasks")
                .update(update_data)
                .eq("id", task_id)
                .eq("project_id", project_id)
                .execute()
            )

            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Task not found.",
                )

            return response.data[0]

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update task: {str(e)}",
            )

    # ── Upcoming Deadlines ───────────────────────────
    @staticmethod
    def get_upcoming_deadlines(user_id: str, limit: int = 10) -> list[dict]:
        """
        Get upcoming task deadlines across all user's projects.
        Returns tasks that are not completed and have a deadline set,
        ordered by deadline ascending (soonest first).
        """
        try:
            # Get all project IDs for this user
            projects_response = (
                supabase.table("projects")
                .select("id, title")
                .eq("user_id", user_id)
                .execute()
            )
            projects = {p["id"]: p["title"] for p in projects_response.data}

            if not projects:
                return []

            # Get tasks with deadlines that aren't completed
            project_ids = list(projects.keys())
            tasks_response = (
                supabase.table("tasks")
                .select("id, project_id, title, deadline, status")
                .in_("project_id", project_ids)
                .neq("status", "completed")
                .not_.is_("deadline", "null")
                .order("deadline")
                .limit(limit)
                .execute()
            )

            deadlines = []
            for task in tasks_response.data:
                deadlines.append({
                    "project_id": task["project_id"],
                    "project_title": projects.get(task["project_id"], "Unknown"),
                    "task_id": task["id"],
                    "task_title": task["title"],
                    "deadline": task["deadline"],
                    "status": task["status"],
                })

            return deadlines

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch deadlines: {str(e)}",
            )

    # ── Delete Project ───────────────────────────────
    @staticmethod
    def delete_project(project_id: str, user_id: str) -> dict:
        """Delete a project and all its modules/tasks (cascading delete in DB)."""
        try:
            response = (
                supabase.table("projects")
                .delete()
                .eq("id", project_id)
                .eq("user_id", user_id)
                .execute()
            )

            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Project not found.",
                )

            return {"message": "Project deleted successfully.", "success": True}

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete project: {str(e)}",
            )
