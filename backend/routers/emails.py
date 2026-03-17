from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db
from auth import get_current_user
import models

router = APIRouter(prefix="/api/emails", tags=["emails"])


class EmailSend(BaseModel):
    to_email: str
    subject: str
    body: str
    email_type: str  # interview_invite, rejection, offer, follow_up
    application_id: Optional[int] = None


@router.get("")
def list_emails(
    application_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = db.query(models.EmailLog).order_by(models.EmailLog.sent_at.desc())
    if application_id:
        query = query.filter(models.EmailLog.application_id == application_id)
    emails = query.limit(100).all()
    return [
        {
            "id": e.id,
            "to_email": e.to_email,
            "subject": e.subject,
            "body": e.body,
            "email_type": e.email_type,
            "application_id": e.application_id,
            "sent_by": e.sent_by.full_name if e.sent_by else None,
            "sent_at": e.sent_at.isoformat() if e.sent_at else None,
        }
        for e in emails
    ]


@router.post("")
def send_email(
    data: EmailSend,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if data.application_id:
        application = db.query(models.Application).filter(
            models.Application.id == data.application_id
        ).first()
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")

    # Log the email (in production, integrate with an email service)
    email_log = models.EmailLog(
        to_email=data.to_email,
        subject=data.subject,
        body=data.body,
        email_type=data.email_type,
        application_id=data.application_id,
        sent_by_id=current_user.id,
    )
    db.add(email_log)

    activity = models.Activity(
        description=f"{current_user.full_name} sent {data.email_type} email to {data.to_email}",
        activity_type="email",
    )
    db.add(activity)
    db.commit()
    db.refresh(email_log)

    return {
        "id": email_log.id,
        "message": "Email logged successfully",
        "to_email": email_log.to_email,
        "subject": email_log.subject,
        "email_type": email_log.email_type,
        "sent_at": email_log.sent_at.isoformat() if email_log.sent_at else None,
    }


@router.get("/{email_id}")
def get_email(
    email_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    email = db.query(models.EmailLog).filter(models.EmailLog.id == email_id).first()
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")
    return {
        "id": email.id,
        "to_email": email.to_email,
        "subject": email.subject,
        "body": email.body,
        "email_type": email.email_type,
        "application_id": email.application_id,
        "sent_by": email.sent_by.full_name if email.sent_by else None,
        "sent_at": email.sent_at.isoformat() if email.sent_at else None,
    }
