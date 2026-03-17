from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from database import get_db
from auth import get_current_user
import models
from datetime import datetime

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


@router.get("", response_model=List[JobResponse])
def list_jobs(active_only: bool = False, db: Session = Depends(get_db)):
    query = db.query(models.Job)
    if active_only:
        query = query.filter(models.Job.is_active == True)
    jobs = query.order_by(models.Job.created_at.desc()).all()
    result = []
    for job in jobs:
        job_dict = {
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
        result.append(job_dict)
    return result


@router.get("/public", response_model=List[JobResponse])
def list_public_jobs(db: Session = Depends(get_db)):
    """Public endpoint - no auth required."""
    jobs = db.query(models.Job).filter(models.Job.is_active == True).order_by(models.Job.created_at.desc()).all()
    result = []
    for job in jobs:
        job_dict = {
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
        result.append(job_dict)
    return result


@router.get("/{job_id}")
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
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
    job = models.Job(**job_data.model_dump())
    db.add(job)
    db.commit()
    db.refresh(job)
    activity = models.Activity(description=f"New job posted: {job.title}", activity_type="job_created")
    db.add(activity)
    db.commit()
    return {**job.__dict__, "application_count": 0}


@router.put("/{job_id}", response_model=JobResponse)
def update_job(job_id: int, job_data: JobUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    for key, value in job_data.model_dump(exclude_unset=True).items():
        setattr(job, key, value)
    db.commit()
    db.refresh(job)
    return {**job.__dict__, "application_count": len(job.applications)}


@router.delete("/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    db.delete(job)
    db.commit()
    return {"message": "Job deleted"}
