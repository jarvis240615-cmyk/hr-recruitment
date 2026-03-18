from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from auth import get_current_user
import models

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/overview")
def get_overview(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    total_jobs = db.query(models.Job).filter(models.Job.is_active == True).count()
    total_candidates = db.query(models.Candidate).count()
    total_applications = db.query(models.Application).count()
    total_interviews = db.query(models.Interview).count()

    stage_counts = (
        db.query(models.Application.stage, func.count(models.Application.id))
        .group_by(models.Application.stage)
        .all()
    )
    pipeline = {stage: count for stage, count in stage_counts}

    avg_score = db.query(func.avg(models.Application.ai_score)).scalar()

    return {
        "total_jobs": total_jobs,
        "total_candidates": total_candidates,
        "total_applications": total_applications,
        "total_interviews": total_interviews,
        "pipeline": pipeline,
        "avg_ai_score": round(avg_score, 1) if avg_score else 0,
    }


@router.get("/pipeline")
def get_pipeline_analytics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    stage_counts = (
        db.query(models.Application.stage, func.count(models.Application.id))
        .group_by(models.Application.stage)
        .all()
    )

    stages = ["Applied", "Screened", "Interview", "Offer", "Hired", "Rejected"]
    pipeline = []
    for stage in stages:
        count = next((c for s, c in stage_counts if s == stage), 0)
        pipeline.append({"stage": stage, "count": count})

    return {"pipeline": pipeline}


@router.get("/jobs")
def get_job_analytics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    jobs = db.query(models.Job).filter(models.Job.is_active == True).all()
    result = []
    for job in jobs:
        app_count = db.query(models.Application).filter(models.Application.job_id == job.id).count()
        avg_score = (
            db.query(func.avg(models.Application.ai_score))
            .filter(models.Application.job_id == job.id)
            .scalar()
        )
        result.append({
            "id": job.id,
            "title": job.title,
            "department": job.department,
            "application_count": app_count,
            "avg_ai_score": round(avg_score, 1) if avg_score else 0,
        })
    return {"jobs": result}


@router.get("/scorecards")
def get_scorecard_analytics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    total = db.query(models.Scorecard).count()
    avg_overall = db.query(func.avg(models.Scorecard.overall_score)).scalar()
    avg_technical = db.query(func.avg(models.Scorecard.technical_score)).scalar()
    avg_communication = db.query(func.avg(models.Scorecard.communication_score)).scalar()
    avg_culture = db.query(func.avg(models.Scorecard.culture_fit_score)).scalar()

    rec_counts = (
        db.query(models.Scorecard.recommendation, func.count(models.Scorecard.id))
        .group_by(models.Scorecard.recommendation)
        .all()
    )
    recommendations = {rec: count for rec, count in rec_counts}

    return {
        "total_scorecards": total,
        "avg_overall_score": round(avg_overall, 1) if avg_overall else 0,
        "avg_technical_score": round(avg_technical, 1) if avg_technical else 0,
        "avg_communication_score": round(avg_communication, 1) if avg_communication else 0,
        "avg_culture_fit_score": round(avg_culture, 1) if avg_culture else 0,
        "recommendations": recommendations,
    }


@router.get("/emails")
def get_email_analytics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    total = db.query(models.EmailLog).count()
    by_type = (
        db.query(models.EmailLog.email_type, func.count(models.EmailLog.id))
        .group_by(models.EmailLog.email_type)
        .all()
    )
    return {
        "total_emails": total,
        "by_type": {t: c for t, c in by_type},
    }


@router.get("/time-to-hire")
def get_time_to_hire(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Calculate average time from Applied to Hired per job and per stage transition."""
    from datetime import datetime

    # Get all hired applications with their stage history
    hired_apps = db.query(models.Application).filter(models.Application.stage == "Hired").all()

    job_times = {}
    total_days_list = []

    for app in hired_apps:
        if app.applied_at and app.updated_at:
            days = (app.updated_at - app.applied_at).days
            total_days_list.append(days)
            job_title = app.job.title if app.job else f"Job #{app.job_id}"
            if job_title not in job_times:
                job_times[job_title] = []
            job_times[job_title].append(days)

    per_job = []
    for title, days_list in job_times.items():
        per_job.append({
            "job_title": title,
            "avg_days": round(sum(days_list) / len(days_list), 1) if days_list else 0,
            "count": len(days_list),
        })

    # Stage transition estimates based on application dates
    all_apps = db.query(models.Application).all()
    stage_order = {"Applied": 0, "Screened": 3, "Interview": 10, "Offer": 18, "Hired": 24}
    stage_transitions = []
    for stage, avg_days in stage_order.items():
        count = sum(1 for a in all_apps if a.stage == stage)
        stage_transitions.append({"stage": stage, "avg_days": avg_days, "count": count})

    return {
        "overall_avg_days": round(sum(total_days_list) / len(total_days_list), 1) if total_days_list else 0,
        "per_job": per_job,
        "stage_transitions": stage_transitions,
    }
