from fastapi import FastAPI
from app.middleware.cors import setup_cors
from app.routers import auth

# ──────────────────────────────────────────────
# App Initialization
# ──────────────────────────────────────────────

app = FastAPI(
    title="SPM Agent API",
    description="AI Software Product Manager — Backend API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ──────────────────────────────────────────────
# Middleware
# ──────────────────────────────────────────────

setup_cors(app)

# ──────────────────────────────────────────────
# Routers
# ──────────────────────────────────────────────

app.include_router(auth.router)

# ──────────────────────────────────────────────
# Health Check
# ──────────────────────────────────────────────


@app.get("/", tags=["Health"])
async def health_check():
    """Root endpoint — confirms the API is running."""
    return {
        "status": "healthy",
        "service": "SPM Agent API",
        "version": "0.1.0",
    }


@app.get("/api/health", tags=["Health"])
async def api_health():
    """API health check endpoint."""
    return {"status": "ok"}
