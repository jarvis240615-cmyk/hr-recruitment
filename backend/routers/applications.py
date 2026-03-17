from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from database import get_db
from auth import get_current_user
import models
from datetime import datetime
import os
import shutil

router = APIRouter(prefix="/api/applications", tags=["applications"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend", "uploads")
# Fix path - we're already in backend
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")


class StageUpdate(BaseModel):
    stage: str


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


@router.get("", response_model=List[ApplicationResponse])
def list_applications(job_id: Optional[int] = None, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    query = db.query(models.Application)
    if job_id:
        query = query.filter(models.Application.job_id == job_id)
    applications = query.order_by(models.Application.applied_at.desc()).all()
    result = []
    for app in applications:
        result.append({
            "id": app.id,
            "job_id": app.job_id,
            "candidate_id": app.candidate_id,
            "stage": app.stage,
            "ai_score": app.ai_score,
            "ai_reasoning": app.ai_reasoning,
            "cover_letter": app.cover_letter,
            "applied_at": app.applied_at,
            "candidate_name": app.candidate.full_name if app.candidate else "",
            "candidate_email": app.candidate.email if app.candidate else "",
            "job_title": app.job.title if app.job else "",
            "job_department": app.job.department if app.job else "",
        })
    return result


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


@router.put("/{application_id}/stage", response_model=ApplicationResponse)
def update_stage(application_id: int, stage_data: StageUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    app = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    old_stage = app.stage
    app.stage = stage_data.stage
    app.updated_at = datetime.utcnow()

    activity = models.Activity(
        description=f"{app.candidate.full_name} moved from {old_stage} to {stage_data.stage} for {app.job.title}",
        activity_type="stage_change",
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
    full_name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(""),
    cover_letter: str = Form(""),
    resume: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    """Public endpoint - no auth required. Candidates apply here."""
    job = db.query(models.Job).filter(models.Job.id == job_id, models.Job.is_active == True).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or no longer active")

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
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        filename = f"{candidate.id}_{job_id}_{resume.filename}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as f:
            shutil.copyfileobj(resume.file, f)
        resume_path = filename
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
    screen_resume_task(db, application.id)

    return {"message": "Application submitted successfully", "application_id": application.id}


@router.get("/{application_id}")
def get_application(application_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    app = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
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
