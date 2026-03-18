from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, field_validator
from typing import Optional, List
from database import get_db
from auth import get_current_user
from utils.errors import APIError
from utils.sanitize import sanitize_input
from utils.pagination import PaginatedResponse
import models
from datetime import datetime
from uuid import uuid4
import os
import shutil

router = APIRouter(prefix="/api/applications", tags=["applications"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")

ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

# Magic bytes for file validation
MAGIC_BYTES = {
    "application/pdf": b"%PDF",
    "application/msword": b"\xd0\xcf\x11\xe0",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": b"PK\x03\x04",
}

ALLOWED_STAGES = {"Applied", "Screened", "Interview", "Offer", "Hired", "Rejected"}


class StageUpdate(BaseModel):
    stage: str

    @field_validator("stage")
    @classmethod
    def validate_stage(cls, v: str) -> str:
        if v not in ALLOWED_STAGES:
            raise ValueError(f"Invalid stage. Must be one of: {', '.join(sorted(ALLOWED_STAGES))}")
        return v


class ApplicationResponse(BaseModel):
    id: int
    job_id: int
    candidate_id: int
    stage: str
    ai_score: Optional[float]
    ai_reasoning: Optional[str]
    cover_letter: Optional[str]
    applied_at: datetime
    candidate_name: str = ""
    candidate_email: str = ""
    job_title: str = ""
    job_department: str = ""

    class Config:
        from_attributes = True


@router.get("")
def list_applications(job_id: Optional[int] = None, page: int = 1, limit: int = 50, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    query = db.query(models.Application)
    if job_id:
        query = query.filter(models.Application.job_id == job_id)
    total = query.count()
    skip = (page - 1) * limit
    applications = query.order_by(models.Application.applied_at.desc()).offset(skip).limit(limit).all()
    items = []
    for app in applications:
        items.append({
            "id": app.id,
            "job_id": app.job_id,
            "candidate_id": app.candidate_id,
            "stage": app.stage,
            "ai_score": app.ai_score,
            "ai_reasoning": app.ai_reasoning,
            "cover_letter": app.cover_letter,
            "applied_at": app.applied_at.isoformat() if app.applied_at else None,
            "candidate_name": app.candidate.full_name if app.candidate else "",
            "candidate_email": app.candidate.email if app.candidate else "",
            "job_title": app.job.title if app.job else "",
            "job_department": app.job.department if app.job else "",
        })
    return PaginatedResponse.create(items=items, total=total, page=page, limit=limit)


@router.get("/pipeline")
def get_pipeline(job_id: Optional[int] = None, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Get applications grouped by stage for kanban view."""
    query = db.query(models.Application)
    if job_id:
        query = query.filter(models.Application.job_id == job_id)
    applications = query.all()

    pipeline = {
        "Applied": [],
        "Screened": [],
        "Interview": [],
        "Offer": [],
        "Hired": [],
        "Rejected": [],
    }
    for app in applications:
        card = {
            "id": app.id,
            "job_id": app.job_id,
            "candidate_id": app.candidate_id,
            "stage": app.stage,
            "ai_score": app.ai_score,
            "ai_reasoning": app.ai_reasoning,
            "applied_at": app.applied_at.isoformat() if app.applied_at else None,
            "candidate_name": app.candidate.full_name if app.candidate else "",
            "candidate_email": app.candidate.email if app.candidate else "",
            "job_title": app.job.title if app.job else "",
            "job_department": app.job.department if app.job else "",
            "resume_path": app.candidate.resume_path if app.candidate else None,
        }
        if app.stage in pipeline:
            pipeline[app.stage].append(card)
    return pipeline


@router.put("/{application_id}/stage")
def update_stage(application_id: int, stage_data: StageUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    app = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not app:
        raise APIError(status_code=404, error="NotFound", message="Application not found", details={"id": application_id})

    old_stage = app.stage
    app.stage = stage_data.stage
    app.updated_at = datetime.utcnow()

    activity = models.Activity(
        description=f"{app.candidate.full_name} moved from {old_stage} to {stage_data.stage} for {app.job.title}",
        activity_type="stage_change",
        user_id=current_user.id,
    )
    db.add(activity)
    db.commit()
    db.refresh(app)

    return {
        "id": app.id,
        "job_id": app.job_id,
        "candidate_id": app.candidate_id,
        "stage": app.stage,
        "ai_score": app.ai_score,
        "ai_reasoning": app.ai_reasoning,
        "cover_letter": app.cover_letter,
        "applied_at": app.applied_at,
        "candidate_name": app.candidate.full_name,
        "candidate_email": app.candidate.email,
        "job_title": app.job.title,
        "job_department": app.job.department,
    }


@router.post("/apply/{job_id}")
async def public_apply(
    job_id: int,
    request: Request,
    background_tasks: BackgroundTasks,
    full_name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(""),
    cover_letter: str = Form(""),
    resume: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    """Public endpoint - no auth required. Candidates apply here."""
    # Rate limit: 3 requests per minute per IP
    client_ip = request.client.host if request.client else "unknown"
    from main import check_rate_limit
    if not check_rate_limit(f"apply:{client_ip}", max_requests=3, window_seconds=60):
        raise HTTPException(status_code=429, detail="Too many applications. Please try again later.")

    # Input sanitization
    full_name = sanitize_input(full_name, max_length=100)
    cover_letter = sanitize_input(cover_letter, max_length=5000)
    phone = sanitize_input(phone, max_length=20)

    if not full_name:
        raise HTTPException(status_code=400, detail="Name is required")

    job = db.query(models.Job).filter(models.Job.id == job_id, models.Job.is_active == True).first()
    if not job:
        raise APIError(status_code=404, error="NotFound", message="Job not found or no longer active", details={"job_id": job_id})

    # Check if candidate already exists
    candidate = db.query(models.Candidate).filter(models.Candidate.email == email).first()
    if not candidate:
        candidate = models.Candidate(full_name=full_name, email=email, phone=phone)
        db.add(candidate)
        db.flush()

    # Check for duplicate application
    existing = db.query(models.Application).filter(
        models.Application.job_id == job_id,
        models.Application.candidate_id == candidate.id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already applied for this position")

    # Handle resume upload
    resume_path = None
    if resume:
        # Validate MIME type
        if resume.content_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(status_code=400, detail=f"Invalid file type '{resume.content_type}'. Allowed: PDF, Word, or plain text.")
        # Validate file size
        contents = await resume.read()
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File too large. Maximum size is 5MB.")

        # Validate magic bytes
        if resume.content_type in MAGIC_BYTES:
            expected_magic = MAGIC_BYTES[resume.content_type]
            if not contents[:len(expected_magic)].startswith(expected_magic):
                raise HTTPException(status_code=400, detail="File content does not match declared type. Upload rejected.")

        await resume.seek(0)

        os.makedirs(UPLOAD_DIR, exist_ok=True)
        ext = os.path.splitext(resume.filename or "")[1]
        safe_filename = f"{uuid4().hex}{ext}"
        filepath = os.path.join(UPLOAD_DIR, safe_filename)
        with open(filepath, "wb") as f:
            f.write(contents)
        resume_path = safe_filename
        candidate.resume_path = resume_path

    application = models.Application(
        job_id=job_id,
        candidate_id=candidate.id,
        stage="Applied",
        cover_letter=cover_letter,
    )
    db.add(application)

    activity = models.Activity(
        description=f"{full_name} applied for {job.title}",
        activity_type="application",
    )
    db.add(activity)
    db.commit()
    db.refresh(application)

    # Trigger AI screening in background
    from routers.screening import screen_resume_task
    background_tasks.add_task(screen_resume_task, db, application.id)

    return {"message": "Application submitted successfully", "application_id": application.id}


@router.get("/{application_id}")
def get_application(application_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    app = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not app:
        raise APIError(status_code=404, error="NotFound", message="Application not found", details={"id": application_id})
    return {
        "id": app.id,
        "job_id": app.job_id,
        "candidate_id": app.candidate_id,
        "stage": app.stage,
        "ai_score": app.ai_score,
        "ai_reasoning": app.ai_reasoning,
        "cover_letter": app.cover_letter,
        "applied_at": app.applied_at,
        "candidate_name": app.candidate.full_name,
        "candidate_email": app.candidate.email,
        "candidate_phone": app.candidate.phone,
        "job_title": app.job.title,
        "job_department": app.job.department,
        "resume_path": app.candidate.resume_path,
        "interviews": [
            {
                "id": i.id,
                "scheduled_at": i.scheduled_at.isoformat() if i.scheduled_at else None,
                "duration_minutes": i.duration_minutes,
                "location": i.location,
                "status": i.status,
                "notes": i.notes,
            }
            for i in app.interviews
        ],
    }
