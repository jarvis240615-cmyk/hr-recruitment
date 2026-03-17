from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from database import get_db
from auth import get_current_user
import models

router = APIRouter(prefix="/api/scorecards", tags=["scorecards"])


class ScorecardCreate(BaseModel):
    application_id: int
    technical_score: int = Field(ge=1, le=5)
    communication_score: int = Field(ge=1, le=5)
    culture_fit_score: int = Field(ge=1, le=5)
    overall_score: int = Field(ge=1, le=5)
    strengths: Optional[str] = None
    weaknesses: Optional[str] = None
    recommendation: str  # strong_yes, yes, neutral, no, strong_no
    notes: Optional[str] = None


class ScorecardUpdate(BaseModel):
    technical_score: Optional[int] = Field(None, ge=1, le=5)
    communication_score: Optional[int] = Field(None, ge=1, le=5)
    culture_fit_score: Optional[int] = Field(None, ge=1, le=5)
    overall_score: Optional[int] = Field(None, ge=1, le=5)
    strengths: Optional[str] = None
    weaknesses: Optional[str] = None
    recommendation: Optional[str] = None
    notes: Optional[str] = None


@router.get("")
def list_scorecards(
    application_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = db.query(models.Scorecard)
    if application_id:
        query = query.filter(models.Scorecard.application_id == application_id)
    scorecards = query.all()
    return [
        {
            "id": s.id,
            "application_id": s.application_id,
            "interviewer_id": s.interviewer_id,
            "interviewer_name": s.interviewer.full_name if s.interviewer else None,
            "technical_score": s.technical_score,
            "communication_score": s.communication_score,
            "culture_fit_score": s.culture_fit_score,
            "overall_score": s.overall_score,
            "strengths": s.strengths,
            "weaknesses": s.weaknesses,
            "recommendation": s.recommendation,
            "notes": s.notes,
            "created_at": s.created_at.isoformat() if s.created_at else None,
        }
        for s in scorecards
    ]


@router.post("")
def create_scorecard(
    data: ScorecardCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    application = db.query(models.Application).filter(models.Application.id == data.application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    scorecard = models.Scorecard(
        application_id=data.application_id,
        interviewer_id=current_user.id,
        technical_score=data.technical_score,
        communication_score=data.communication_score,
        culture_fit_score=data.culture_fit_score,
        overall_score=data.overall_score,
        strengths=data.strengths,
        weaknesses=data.weaknesses,
        recommendation=data.recommendation,
        notes=data.notes,
    )
    db.add(scorecard)

    activity = models.Activity(
        description=f"{current_user.full_name} submitted scorecard for application #{data.application_id}",
        activity_type="scorecard",
    )
    db.add(activity)
    db.commit()
    db.refresh(scorecard)

    return {
        "id": scorecard.id,
        "application_id": scorecard.application_id,
        "interviewer_id": scorecard.interviewer_id,
        "overall_score": scorecard.overall_score,
        "recommendation": scorecard.recommendation,
        "created_at": scorecard.created_at.isoformat() if scorecard.created_at else None,
    }


@router.get("/{scorecard_id}")
def get_scorecard(
    scorecard_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    scorecard = db.query(models.Scorecard).filter(models.Scorecard.id == scorecard_id).first()
    if not scorecard:
        raise HTTPException(status_code=404, detail="Scorecard not found")
    return {
        "id": scorecard.id,
        "application_id": scorecard.application_id,
        "interviewer_id": scorecard.interviewer_id,
        "interviewer_name": scorecard.interviewer.full_name if scorecard.interviewer else None,
        "technical_score": scorecard.technical_score,
        "communication_score": scorecard.communication_score,
        "culture_fit_score": scorecard.culture_fit_score,
        "overall_score": scorecard.overall_score,
        "strengths": scorecard.strengths,
        "weaknesses": scorecard.weaknesses,
        "recommendation": scorecard.recommendation,
        "notes": scorecard.notes,
        "created_at": scorecard.created_at.isoformat() if scorecard.created_at else None,
        "updated_at": scorecard.updated_at.isoformat() if scorecard.updated_at else None,
    }


@router.put("/{scorecard_id}")
def update_scorecard(
    scorecard_id: int,
    data: ScorecardUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    scorecard = db.query(models.Scorecard).filter(models.Scorecard.id == scorecard_id).first()
    if not scorecard:
        raise HTTPException(status_code=404, detail="Scorecard not found")
    if scorecard.interviewer_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Can only edit your own scorecards")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(scorecard, key, value)

    db.commit()
    db.refresh(scorecard)
    return {"id": scorecard.id, "message": "Scorecard updated"}
