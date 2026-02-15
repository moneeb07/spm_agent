from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings

 
def setup_cors(app):
    """
    Configure CORS middleware for the FastAPI app.
    Allows the frontend origin to make requests with credentials.
    """
    settings = get_settings()
    print("CORS ALLOWED:", settings.FRONTEND_URL)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            settings.FRONTEND_URL,
            "http://localhost:3000",  # Local dev fallback
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
