from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, SessionLocal
import models
from seed import seed_database

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="HR Recruitment API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    return {"status": "healthy"}
