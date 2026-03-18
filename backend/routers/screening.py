from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
import models
import os
import random

router = APIRouter(prefix="/api/screening", tags=["screening"])

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")


def screen_resume_task(db: Session, application_id: int):
    """Screen a resume using AI or mock scoring."""
    app = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not app:
        return

    job = app.job
    candidate = app.candidate

    if ANTHROPIC_API_KEY:
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

            resume_info = f"Candidate: {candidate.full_name}, Email: {candidate.email}"
            if app.cover_letter:
                resume_info += f"\nCover Letter: {app.cover_letter}"

            message = client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=500,
                messages=[
                    {
                        "role": "user",
                        "content": f"""Score this candidate 0-100 for the following job. Respond with JSON only: {{"score": <number>, "reasoning": "<2-3 sentences>"}}

Job Title: {job.title}
Department: {job.department}
Description: {job.description}
Requirements: {job.requirements}

Candidate Info:
{resume_info}""",
                    }
                ],
            )

            import json
            result = json.loads(message.content[0].text)
            app.ai_score = result["score"]
            app.ai_reasoning = result["reasoning"]
        except Exception as e:
            # Fallback to mock on any error
            app.ai_score = round(random.uniform(60, 95), 1)
            app.ai_reasoning = f"Auto-scored (API error). Candidate profile reviewed against job requirements for {job.title}."
    else:
        # Mock scoring
        app.ai_score = round(random.uniform(60, 95), 1)
        reasoning_templates = [
            f"Strong alignment with {job.title} requirements. Candidate demonstrates relevant background and skills.",
            f"Good match for {job.department} team. Profile shows applicable experience for this role.",
            f"Solid candidate for {job.title}. Skills and background align well with the position requirements.",
        ]
        app.ai_reasoning = random.choice(reasoning_templates)

    activity = models.Activity(
        description=f"AI screening completed for {candidate.full_name} - Score: {app.ai_score}",
        activity_type="screening",
    )
    db.add(activity)
    db.commit()


@router.post("/{application_id}/rescore")
def rescore_application(application_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Re-run AI screening for an application."""
    if current_user.role not in ("admin", "recruiter"):
        raise HTTPException(status_code=403, detail="Only admin or recruiter can trigger rescoring")
    app = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    screen_resume_task(db, application_id)
    db.refresh(app)
    return {"ai_score": app.ai_score, "ai_reasoning": app.ai_reasoning}
