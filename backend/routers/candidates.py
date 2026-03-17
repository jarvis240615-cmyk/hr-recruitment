from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from database import get_db
from auth import get_current_user
import models
from datetime import datetime

router = APIRouter(prefix="/api/candidates", tags=["candidates"])


class CandidateResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str]
    resume_path: Optional[str]
    created_at: datetime
    applications: list = []

    class Config:
        from_attributes = True


@router.get("", response_model=List[CandidateResponse])
def list_candidates(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    candidates = db.query(models.Candidate).order_by(models.Candidate.created_at.desc()).all()
    result = []
    for c in candidates:
        apps = []
        for a in c.applications:
            apps.append({
                "id": a.id,
                "job_id": a.job_id,
                "job_title": a.job.title if a.job else "",
                "stage": a.stage,
                "ai_score": a.ai_score,
                "applied_at": a.applied_at.isoformat() if a.applied_at else None,
            })
        result.append({
            "id": c.id,
            "full_name": c.full_name,
            "email": c.email,
            "phone": c.phone,
            "resume_path": c.resume_path,
            "created_at": c.created_at,
            "applications": apps,
        })
    return result


@router.get("/{candidate_id}")
def get_candidate(candidate_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    apps = []
    for a in candidate.applications:
        apps.append({
            "id": a.id,
            "job_id": a.job_id,
            "job_title": a.job.title if a.job else "",
            "stage": a.stage,
            "ai_score": a.ai_score,
            "ai_reasoning": a.ai_reasoning,
            "applied_at": a.applied_at.isoformat() if a.applied_at else None,
        })
    return {
        "id": candidate.id,
        "full_name": candidate.full_name,
        "email": candidate.email,
        "phone": candidate.phone,
        "resume_path": candidate.resume_path,
        "created_at": candidate.created_at,
        "applications": apps,
    }
