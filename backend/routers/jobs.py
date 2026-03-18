from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional, List
from database import get_db
from auth import get_current_user
from utils.errors import APIError
from utils.pagination import PaginatedResponse
import models
from datetime import datetime
import os

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


class JobCreate(BaseModel):
    title: str
    department: str
    location: str = "Remote"
    description: str
    requirements: str
    salary_range: Optional[str] = None


class JobUpdate(BaseModel):
    title: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    salary_range: Optional[str] = None
    is_active: Optional[bool] = None


class JobResponse(BaseModel):
    id: int
    title: str
    department: str
    location: str
    description: str
    requirements: str
    salary_range: Optional[str]
    is_active: bool
    created_at: datetime
    application_count: int = 0

    class Config:
        from_attributes = True


class JDGenerateRequest(BaseModel):
    title: str
    department: str
    requirements_brief: str = ""


@router.get("")
def list_jobs(active_only: bool = False, page: int = 1, limit: int = 50, db: Session = Depends(get_db)):
    base_query = db.query(models.Job)
    if active_only:
        base_query = base_query.filter(models.Job.is_active == True)
    total = base_query.count()
    skip = (page - 1) * limit

    app_count = func.count(models.Application.id).label("application_count")
    query = db.query(models.Job, app_count).outerjoin(models.Application).group_by(models.Job.id)
    if active_only:
        query = query.filter(models.Job.is_active == True)
    rows = query.order_by(models.Job.created_at.desc()).offset(skip).limit(limit).all()
    items = []
    for job, count in rows:
        items.append({
            "id": job.id,
            "title": job.title,
            "department": job.department,
            "location": job.location,
            "description": job.description,
            "requirements": job.requirements,
            "salary_range": job.salary_range,
            "is_active": job.is_active,
            "created_at": job.created_at,
            "application_count": count,
        })
    return PaginatedResponse.create(items=items, total=total, page=page, limit=limit)


@router.get("/public", response_model=List[JobResponse])
def list_public_jobs(db: Session = Depends(get_db)):
    """Public endpoint - no auth required."""
    app_count = func.count(models.Application.id).label("application_count")
    rows = db.query(models.Job, app_count).outerjoin(models.Application).group_by(models.Job.id).filter(
        models.Job.is_active == True
    ).order_by(models.Job.created_at.desc()).all()
    result = []
    for job, count in rows:
        result.append({
            "id": job.id,
            "title": job.title,
            "department": job.department,
            "location": job.location,
            "description": job.description,
            "requirements": job.requirements,
            "salary_range": job.salary_range,
            "is_active": job.is_active,
            "created_at": job.created_at,
            "application_count": count,
        })
    return result


@router.get("/{job_id}")
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise APIError(status_code=404, error="NotFound", message="Job not found", details={"id": job_id})
    return {
        "id": job.id,
        "title": job.title,
        "department": job.department,
        "location": job.location,
        "description": job.description,
        "requirements": job.requirements,
        "salary_range": job.salary_range,
        "is_active": job.is_active,
        "created_at": job.created_at,
        "application_count": len(job.applications),
    }


@router.post("", response_model=JobResponse)
def create_job(job_data: JobCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role not in ("admin", "recruiter"):
        raise APIError(status_code=403, error="Forbidden", message="Only admin or recruiter can create jobs")
    job = models.Job(**job_data.model_dump())
    db.add(job)
    db.commit()
    db.refresh(job)
    activity = models.Activity(description=f"New job posted: {job.title}", activity_type="job_created", user_id=current_user.id)
    db.add(activity)
    db.commit()
    return {
        "id": job.id, "title": job.title, "department": job.department,
        "location": job.location, "description": job.description,
        "requirements": job.requirements, "salary_range": job.salary_range,
        "is_active": job.is_active, "created_at": job.created_at,
        "application_count": 0,
    }


@router.put("/{job_id}", response_model=JobResponse)
def update_job(job_id: int, job_data: JobUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role not in ("admin", "recruiter"):
        raise APIError(status_code=403, error="Forbidden", message="Only admin or recruiter can update jobs")
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise APIError(status_code=404, error="NotFound", message="Job not found", details={"id": job_id})
    for key, value in job_data.model_dump(exclude_unset=True).items():
        setattr(job, key, value)
    db.commit()
    db.refresh(job)
    return {
        "id": job.id, "title": job.title, "department": job.department,
        "location": job.location, "description": job.description,
        "requirements": job.requirements, "salary_range": job.salary_range,
        "is_active": job.is_active, "created_at": job.created_at,
        "application_count": len(job.applications),
    }


@router.delete("/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role not in ("admin", "recruiter"):
        raise APIError(status_code=403, error="Forbidden", message="Only admin or recruiter can delete jobs")
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise APIError(status_code=404, error="NotFound", message="Job not found", details={"id": job_id})
    db.delete(job)
    db.commit()
    return {"message": "Job deleted"}


@router.post("/generate-description")
def generate_job_description(
    data: JDGenerateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Generate a job description using AI."""
    api_key = os.getenv("ANTHROPIC_API_KEY")

    if api_key:
        try:
            import anthropic
            import json
            client = anthropic.Anthropic(api_key=api_key)
            message = client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=1000,
                messages=[{
                    "role": "user",
                    "content": f"""Generate a professional job description in JSON format: {{"description": "<full description>", "requirements": "<requirements list>"}}

Title: {data.title}
Department: {data.department}
Additional context: {data.requirements_brief or 'None provided'}

Write a compelling, detailed job description with responsibilities and requirements.""",
                }],
            )
            result = json.loads(message.content[0].text)
            return {
                "title": data.title,
                "department": data.department,
                "description": result.get("description", ""),
                "requirements": result.get("requirements", ""),
            }
        except Exception:
            pass

    # Fallback: generate a template-based description
    description = f"""We are seeking a talented {data.title} to join our {data.department} team. The ideal candidate will bring strong expertise and a collaborative mindset to drive impactful results.

Responsibilities:
- Lead key initiatives within the {data.department} department
- Collaborate cross-functionally to deliver high-quality results
- Mentor junior team members and drive best practices
- Contribute to strategic planning and process improvements
- Stay current with industry trends and technologies"""

    requirements = f"""Requirements:
- 3+ years of relevant experience in {data.department} or related field
- Strong communication and problem-solving skills
- Track record of delivering results in a fast-paced environment
- Bachelor's degree or equivalent practical experience
- Ability to work independently and in team settings"""

    if data.requirements_brief:
        requirements += f"\n\nAdditional Requirements:\n- {data.requirements_brief}"

    return {
        "title": data.title,
        "department": data.department,
        "description": description,
        "requirements": requirements,
    }
