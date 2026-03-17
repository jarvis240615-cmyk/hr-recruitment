from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from database import get_db
from auth import get_current_user
import models
from datetime import datetime
import json

router = APIRouter(prefix="/api/interviews", tags=["interviews"])


class InterviewCreate(BaseModel):
    application_id: int
    available_slots: List[str]  # ISO datetime strings
    duration_minutes: int = 60
    location: str = "Video Call"


class SlotSelect(BaseModel):
    slot: str  # ISO datetime string


class InterviewResponse(BaseModel):
    id: int
    application_id: int
    scheduled_at: Optional[datetime]
    duration_minutes: int
    location: str
    notes: Optional[str]
    status: str
    available_slots: Optional[str]
    candidate_selected: bool
    candidate_name: str = ""
    job_title: str = ""

    class Config:
        from_attributes = True


@router.get("", response_model=List[InterviewResponse])
def list_interviews(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    interviews = db.query(models.Interview).order_by(models.Interview.created_at.desc()).all()
    result = []
    for i in interviews:
        result.append({
            "id": i.id,
            "application_id": i.application_id,
            "scheduled_at": i.scheduled_at,
            "duration_minutes": i.duration_minutes,
            "location": i.location,
            "notes": i.notes,
            "status": i.status,
            "available_slots": i.available_slots,
            "candidate_selected": i.candidate_selected,
            "candidate_name": i.application.candidate.full_name if i.application and i.application.candidate else "",
            "job_title": i.application.job.title if i.application and i.application.job else "",
        })
    return result


@router.post("", response_model=InterviewResponse)
def create_interview(data: InterviewCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    app = db.query(models.Application).filter(models.Application.id == data.application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    interview = models.Interview(
        application_id=data.application_id,
        available_slots=json.dumps(data.available_slots),
        duration_minutes=data.duration_minutes,
        location=data.location,
        status="pending",
    )
    db.add(interview)

    activity = models.Activity(
        description=f"Interview scheduled for {app.candidate.full_name} - {app.job.title}",
        activity_type="interview",
    )
    db.add(activity)
    db.commit()
    db.refresh(interview)

    return {
        "id": interview.id,
        "application_id": interview.application_id,
        "scheduled_at": interview.scheduled_at,
        "duration_minutes": interview.duration_minutes,
        "location": interview.location,
        "notes": interview.notes,
        "status": interview.status,
        "available_slots": interview.available_slots,
        "candidate_selected": interview.candidate_selected,
        "candidate_name": app.candidate.full_name,
        "job_title": app.job.title,
    }


@router.get("/{interview_id}/slots")
def get_interview_slots(interview_id: int, db: Session = Depends(get_db)):
    """Public endpoint - candidate uses this to pick a slot."""
    interview = db.query(models.Interview).filter(models.Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    slots = json.loads(interview.available_slots) if interview.available_slots else []
    return {
        "id": interview.id,
        "slots": slots,
        "duration_minutes": interview.duration_minutes,
        "location": interview.location,
        "status": interview.status,
        "candidate_name": interview.application.candidate.full_name if interview.application else "",
        "job_title": interview.application.job.title if interview.application else "",
        "scheduled_at": interview.scheduled_at.isoformat() if interview.scheduled_at else None,
        "candidate_selected": interview.candidate_selected,
    }


@router.post("/{interview_id}/select-slot")
def select_slot(interview_id: int, data: SlotSelect, db: Session = Depends(get_db)):
    """Public endpoint - candidate selects a time slot."""
    interview = db.query(models.Interview).filter(models.Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    if interview.candidate_selected:
        raise HTTPException(status_code=400, detail="Slot already selected")

    interview.scheduled_at = datetime.fromisoformat(data.slot)
    interview.candidate_selected = True
    interview.status = "confirmed"

    activity = models.Activity(
        description=f"{interview.application.candidate.full_name} confirmed interview for {interview.application.job.title}",
        activity_type="interview",
    )
    db.add(activity)
    db.commit()
    return {"message": "Interview slot confirmed", "scheduled_at": interview.scheduled_at.isoformat()}


@router.put("/{interview_id}/notes")
def update_notes(interview_id: int, data: dict, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    interview = db.query(models.Interview).filter(models.Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    interview.notes = data.get("notes", "")
    interview.status = data.get("status", interview.status)
    db.commit()
    return {"message": "Interview updated"}
