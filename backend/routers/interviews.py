from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from database import get_db
from auth import get_current_user
import models
from datetime import datetime, timedelta

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
    available_slots: Optional[List[str]] = None
    candidate_selected: bool
    candidate_name: str = ""
    job_title: str = ""

    class Config:
        from_attributes = True


def _get_slot_strings(interview: models.Interview) -> List[str]:
    """Get available slot ISO strings from InterviewSlot records."""
    return [slot.start_time.isoformat() for slot in interview.slots]


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
            "available_slots": _get_slot_strings(i),
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
        duration_minutes=data.duration_minutes,
        location=data.location,
        status="pending",
    )
    db.add(interview)
    db.flush()

    # Create InterviewSlot records for each available slot
    for slot_str in data.available_slots:
        start_time = datetime.fromisoformat(slot_str)
        end_time = start_time + timedelta(minutes=data.duration_minutes)
        slot = models.InterviewSlot(
            interview_id=interview.id,
            start_time=start_time,
            end_time=end_time,
        )
        db.add(slot)

    activity = models.Activity(
        description=f"Interview scheduled for {app.candidate.full_name} - {app.job.title}",
        activity_type="interview",
        user_id=current_user.id,
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
        "available_slots": _get_slot_strings(interview),
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
    return {
        "id": interview.id,
        "slots": _get_slot_strings(interview),
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

    # Find and mark the matching InterviewSlot
    selected_time = datetime.fromisoformat(data.slot)
    matched_slot = None
    for slot in interview.slots:
        if slot.start_time == selected_time:
            matched_slot = slot
            slot.is_selected = True
            break

    if not matched_slot:
        raise HTTPException(status_code=400, detail="Invalid slot selection")

    interview.scheduled_at = selected_time
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
