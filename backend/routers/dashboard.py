from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from auth import get_current_user
import models

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats")
def get_stats(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    open_jobs = db.query(models.Job).filter(models.Job.is_active == True).count()
    total_candidates = db.query(models.Candidate).count()
    total_applications = db.query(models.Application).count()

    # Count by stage
    stage_counts = {}
    stages = ["Applied", "Screened", "Interview", "Offer", "Hired", "Rejected"]
    for stage in stages:
        count = db.query(models.Application).filter(models.Application.stage == stage).count()
        stage_counts[stage] = count

    # Average AI score
    avg_score = db.query(func.avg(models.Application.ai_score)).scalar()

    return {
        "open_jobs": open_jobs,
        "total_candidates": total_candidates,
        "total_applications": total_applications,
        "stage_counts": stage_counts,
        "avg_ai_score": round(avg_score, 1) if avg_score else 0,
    }


@router.get("/recent-activity")
def get_recent_activity(limit: int = 20, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    activities = db.query(models.Activity).order_by(models.Activity.created_at.desc()).limit(limit).all()
    return [
        {
            "id": a.id,
            "description": a.description,
            "activity_type": a.activity_type,
            "created_at": a.created_at.isoformat(),
        }
        for a in activities
    ]
