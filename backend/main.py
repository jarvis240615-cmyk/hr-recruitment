import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from database import engine, SessionLocal
import models
from seed import seed_database
from utils.errors import APIError, api_error_handler

models.Base.metadata.create_all(bind=engine)

tags_metadata = [
    {"name": "auth", "description": "Authentication and user management"},
    {"name": "jobs", "description": "Job posting management"},
    {"name": "candidates", "description": "Candidate profiles and search"},
    {"name": "applications", "description": "Job applications and pipeline"},
    {"name": "interviews", "description": "Interview scheduling and management"},
    {"name": "screening", "description": "AI-powered resume screening"},
    {"name": "scorecards", "description": "Interviewer evaluation scorecards"},
    {"name": "emails", "description": "Email communication logging"},
    {"name": "analytics", "description": "Recruitment analytics and reporting"},
    {"name": "dashboard", "description": "Dashboard statistics and activity"},
]

app = FastAPI(
    title="HR Recruitment Platform API",
    description="AI-powered HR recruitment platform with resume screening, interview management, and analytics.",
    version="2.0.0",
    contact={"name": "HR Platform Team", "email": "support@hrplatform.io"},
    license_info={"name": "MIT", "url": "https://opensource.org/licenses/MIT"},
    openapi_tags=tags_metadata,
)

# Security headers middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

app.add_middleware(SecurityHeadersMiddleware)

cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,https://jarvis240615-cmyk.github.io").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register custom error handler
app.add_exception_handler(APIError, api_error_handler)

# Rate limiter state (simple in-memory token bucket)
from collections import defaultdict
import time

_rate_limit_store = defaultdict(list)


def check_rate_limit(key: str, max_requests: int, window_seconds: int = 60) -> bool:
    """Simple in-memory rate limiter. Returns True if request is allowed."""
    now = time.time()
    # Clean old entries
    _rate_limit_store[key] = [t for t in _rate_limit_store[key] if now - t < window_seconds]
    if len(_rate_limit_store[key]) >= max_requests:
        return False
    _rate_limit_store[key].append(now)
    return True


# Import and mount routers
from routers.auth_router import router as auth_router
from routers.jobs import router as jobs_router
from routers.candidates import router as candidates_router
from routers.applications import router as applications_router
from routers.interviews import router as interviews_router
from routers.screening import router as screening_router
from routers.scorecards import router as scorecards_router
from routers.emails import router as emails_router
from routers.analytics import router as analytics_router
from routers.dashboard import router as dashboard_router

app.include_router(auth_router)
app.include_router(jobs_router)
app.include_router(candidates_router)
app.include_router(applications_router)
app.include_router(interviews_router)
app.include_router(screening_router)
app.include_router(scorecards_router)
app.include_router(emails_router)
app.include_router(analytics_router)
app.include_router(dashboard_router)


@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "version": "2.0.0"}
