import json
import httpx
from fastapi import HTTPException, status
from app.config import get_settings
from app.supabase_client import supabase
from datetime import datetime

class LLMService:
    """
    Handles communication with Google Gemini API.
    Builds structured prompts and parses JSON responses
    to generate project roadmaps (modules + tasks + deadlines).
    """

    @staticmethod
    def _build_prompt(
        description: str,
        tech_stack: list[str],
        planning_mode: str,
        deadline_date: str | None,
        working_hours_per_day: float,
        skill_level: str | None,
        preferred_pace: str | None,
    ) -> str:
        """
        Build the structured prompt that tells the LLM exactly what to generate.
        The prompt asks for a JSON response containing modules and tasks.
        """

        tech_str = ", ".join(tech_stack) if tech_stack else "Not specified"
        skill = skill_level or "medium"
        pace = preferred_pace or "medium"

        deadline_instruction = ""
        if planning_mode == "deadline" and deadline_date:
            deadline_instruction = f"""
                                    CRITICAL CONSTRAINT: The project MUST be completed by {deadline_date}.
                                    - Fit all modules and tasks within this deadline.
                                    - The developer works {working_hours_per_day} hours per day.
                                    - Assign realistic start_date and end_date for each module.
                                    - Assign a deadline for each task that fits within its module's date range.
                                    - If the project cannot reasonably fit in the deadline, compress scope but note it.
                                    """
        else:
            deadline_instruction = f"""
                                    This is an open-ended project with no fixed deadline.
                                    - The developer works {working_hours_per_day} hours per day.
                                    - Estimate realistic durations based on the developer's skill level ({skill}) and pace ({pace}).
                                    - Assign estimated start_date and end_date for each module relative to today.
                                    - Assign deadline for each task based on estimated effort.
                                    """
        current_date = datetime.now().strftime("%Y-%m-%d")
        prompt = f"""You are an expert software product manager. Create a detailed project roadmap.

                PROJECT DESCRIPTION:
                {description}

                TECH STACK: {tech_str}
                DEVELOPER SKILL LEVEL: {skill}
                DEVELOPER PACE: {pace}
                WORKING HOURS PER DAY: {working_hours_per_day}
                PLANNING MODE: {planning_mode}

                {deadline_instruction}

                RESPOND WITH ONLY VALID JSON in this exact format (no markdown, no explanation):
                {{
                "modules": [
                    {{
                    "title": "Module Name",
                    "description": "What this module covers",
                    "order_index": 0,
                    "estimated_days": 3,
                    "start_date": "YYYY-MM-DD",
                    "end_date": "YYYY-MM-DD",
                    "tasks": [
                        {{
                        "title": "Task Name",
                        "description": "What to do",
                        "order_index": 0,
                        "estimated_hours": 4,
                        "deadline": "YYYY-MM-DD"
                        }}
                    ]
                    }}
                ]
                }}

                Rules:
                - Break the project into 3-8 high-level modules.
                - Each module should have 2-6 tasks.
                - Tasks should be actionable and specific.
                - Dates must be realistic and sequential (no overlapping modules unless independent).
                - estimated_hours should reflect the developer's skill level.
                - Order modules by dependency (do prerequisites first).
                - Consider you are giving radmap on this date {current_date}  
                """
        return prompt

    @staticmethod
    async def generate_roadmap(
        description: str,
        tech_stack: list[str],
        planning_mode: str,
        deadline_date: str | None,
        working_hours_per_day: float,
        skill_level: str | None,
        preferred_pace: str | None,
    ) -> dict:
        """
        Call Google Gemini API with the structured prompt.
        Returns parsed JSON with modules and tasks.
        """
        settings = get_settings()

        if not settings.GEMINI_API_KEY:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="GEMINI_API_KEY is not configured.",
            )

        prompt = LLMService._build_prompt(
            description=description,
            tech_stack=tech_stack,
            planning_mode=planning_mode,
            deadline_date=deadline_date,
            working_hours_per_day=working_hours_per_day,
            skill_level=skill_level,
            preferred_pace=preferred_pace,
        )

        # Google Gemini REST API endpoint
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.LLM_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.7,
                "responseMimeType": "application/json",
            },
        }

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(url, json=payload)

                if response.status_code != 200:
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail=f"Gemini API error: {response.status_code} — {response.text}",
                    )

                data = response.json()

                # Extract the text content from Gemini response
                text_content = data["candidates"][0]["content"]["parts"][0]["text"]

                # Parse the JSON from the LLM response
                roadmap = json.loads(text_content)

                return roadmap

        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"LLM returned invalid JSON: {str(e)}",
            )
        except httpx.TimeoutException:
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="LLM request timed out. Try again.",
            )
        except KeyError as e:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Unexpected Gemini response structure: {str(e)}",
            )

    @staticmethod
    async def save_roadmap_to_db(
        project_id: str,
        roadmap: dict,
    ) -> list[dict]:
        """
        Take the parsed LLM roadmap and insert modules + tasks into Supabase.
        Returns the list of created modules (with their tasks).
        """
        modules_data = roadmap.get("modules", [])
        created_modules = []

        for module_data in modules_data:
            # Insert module
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

            # Insert tasks for this module
            tasks = module_data.get("tasks", [])
            created_tasks = []

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

                task_response = (
                    supabase.table("tasks").insert(task_insert).execute()
                )
                created_tasks.append(task_response.data[0])

            module["tasks"] = created_tasks
            created_modules.append(module)

        return created_modules
