from sqlalchemy.orm import Session
from models import User, Job, Candidate, Application, Interview, InterviewSlot, Scorecard, EmailLog, Activity, StageEnum
from auth import get_password_hash
from datetime import datetime, timedelta
import random
import json


def seed_database(db: Session):
    """Seed database with demo data if empty."""
    if db.query(User).count() > 0:
        return

    # Create admin user
    admin = User(
        email="admin@hr.com",
        hashed_password=get_password_hash("admin123"),
        full_name="Admin User",
        role="admin",
    )
    recruiter = User(
        email="recruiter@hr.com",
        hashed_password=get_password_hash("recruiter123"),
        full_name="Sarah Johnson",
        role="recruiter",
    )
    manager = User(
        email="manager@hr.com",
        hashed_password=get_password_hash("manager123"),
        full_name="Mike Chen",
        role="hiring_manager",
    )
    db.add_all([admin, recruiter, manager])
    db.flush()

    # Create 5 jobs
    jobs_data = [
        {
            "title": "Senior Frontend Engineer",
            "department": "Engineering",
            "location": "San Francisco, CA",
            "description": "We're looking for a Senior Frontend Engineer to lead our web application development. You'll work with React, TypeScript, and modern web technologies to build beautiful, performant user interfaces.",
            "requirements": "5+ years of frontend development experience. Expert in React, TypeScript, and CSS. Experience with state management (Redux, Zustand). Strong understanding of web performance optimization. Experience with testing frameworks (Jest, Cypress).",
            "salary_range": "$150,000 - $200,000",
        },
        {
            "title": "Product Manager",
            "department": "Product",
            "location": "New York, NY",
            "description": "Join our product team to define and drive the roadmap for our SaaS platform. You'll work closely with engineering, design, and business stakeholders to deliver features that delight customers.",
            "requirements": "3+ years of product management experience in B2B SaaS. Strong analytical skills and data-driven decision making. Excellent communication and stakeholder management. Experience with agile methodologies. Technical background preferred.",
            "salary_range": "$130,000 - $170,000",
        },
        {
            "title": "DevOps Engineer",
            "department": "Engineering",
            "location": "Remote",
            "description": "We need a DevOps Engineer to build and maintain our cloud infrastructure. You'll design CI/CD pipelines, manage Kubernetes clusters, and ensure our systems are reliable and scalable.",
            "requirements": "4+ years of DevOps/SRE experience. Proficiency with AWS or GCP. Experience with Kubernetes, Docker, and Terraform. Strong scripting skills (Python, Bash). Experience with monitoring tools (Datadog, Prometheus).",
            "salary_range": "$140,000 - $190,000",
        },
        {
            "title": "UX Designer",
            "department": "Design",
            "location": "Austin, TX",
            "description": "We're seeking a talented UX Designer to create intuitive, user-centered designs for our platform. You'll conduct research, create wireframes and prototypes, and collaborate with engineering to ship polished experiences.",
            "requirements": "3+ years of UX design experience. Proficiency in Figma and design systems. Experience with user research and usability testing. Strong portfolio demonstrating end-to-end design process. Understanding of accessibility standards.",
            "salary_range": "$110,000 - $150,000",
        },
        {
            "title": "Data Scientist",
            "department": "Data",
            "location": "Seattle, WA",
            "description": "Join our data team to build machine learning models that power our recommendation engine. You'll work with large datasets, develop predictive models, and collaborate with product to drive business impact.",
            "requirements": "3+ years of data science experience. Strong Python skills with pandas, scikit-learn, and TensorFlow/PyTorch. Experience with SQL and data warehousing. MS or PhD in a quantitative field preferred. Experience deploying ML models to production.",
            "salary_range": "$145,000 - $195,000",
        },
    ]

    jobs = []
    for jd in jobs_data:
        job = Job(**jd)
        jobs.append(job)
        db.add(job)
    db.flush()

    # Create 20 candidates
    candidate_names = [
        ("Alex Rivera", "alex.rivera@email.com", "555-0101"),
        ("Jordan Kim", "jordan.kim@email.com", "555-0102"),
        ("Taylor Chen", "taylor.chen@email.com", "555-0103"),
        ("Morgan Patel", "morgan.patel@email.com", "555-0104"),
        ("Casey Williams", "casey.williams@email.com", "555-0105"),
        ("Riley Thompson", "riley.thompson@email.com", "555-0106"),
        ("Avery Garcia", "avery.garcia@email.com", "555-0107"),
        ("Quinn Martinez", "quinn.martinez@email.com", "555-0108"),
        ("Sage Robinson", "sage.robinson@email.com", "555-0109"),
        ("Blake Anderson", "blake.anderson@email.com", "555-0110"),
        ("Drew Mitchell", "drew.mitchell@email.com", "555-0111"),
        ("Finley Brooks", "finley.brooks@email.com", "555-0112"),
        ("Harper Lewis", "harper.lewis@email.com", "555-0113"),
        ("Jamie Scott", "jamie.scott@email.com", "555-0114"),
        ("Kendall Foster", "kendall.foster@email.com", "555-0115"),
        ("Logan Hayes", "logan.hayes@email.com", "555-0116"),
        ("Micah Reed", "micah.reed@email.com", "555-0117"),
        ("Noah Sullivan", "noah.sullivan@email.com", "555-0118"),
        ("Oakley Price", "oakley.price@email.com", "555-0119"),
        ("Parker Bennett", "parker.bennett@email.com", "555-0120"),
    ]

    stages = [StageEnum.applied, StageEnum.screened, StageEnum.interview, StageEnum.offer, StageEnum.hired, StageEnum.rejected]
    stage_weights = [4, 4, 4, 3, 3, 2]

    reasoning_templates = [
        "Strong match for the role. Candidate demonstrates relevant experience in {area}. Technical skills align well with requirements.",
        "Good candidate with solid background in {area}. Some gaps in specific technologies but shows strong learning ability.",
        "Excellent fit. Deep expertise in {area} with proven track record. Leadership experience is a plus.",
        "Moderate match. Has foundational skills in {area} but may need ramp-up time on specific tools mentioned in requirements.",
        "Very promising candidate. Background in {area} combined with cross-functional experience makes them versatile.",
    ]
    areas = ["frontend development", "product strategy", "cloud infrastructure", "user experience design", "machine learning", "full-stack engineering", "data analysis", "system architecture"]

    candidates = []
    for name, email, phone in candidate_names:
        candidate = Candidate(full_name=name, email=email, phone=phone)
        candidates.append(candidate)
        db.add(candidate)
    db.flush()

    # Create applications spread across jobs and stages
    activities = []
    for i, candidate in enumerate(candidates):
        job = jobs[i % len(jobs)]
        stage = random.choices(stages, weights=stage_weights, k=1)[0]
        score = round(random.uniform(55, 98), 1)
        reasoning = random.choice(reasoning_templates).format(area=random.choice(areas))

        days_ago = random.randint(1, 30)
        applied_at = datetime.utcnow() - timedelta(days=days_ago)

        app = Application(
            job_id=job.id,
            candidate_id=candidate.id,
            stage=stage,
            ai_score=score,
            ai_reasoning=reasoning,
            applied_at=applied_at,
        )
        db.add(app)
        db.flush()

        activities.append(Activity(
            description=f"{candidate.full_name} applied for {job.title}",
            activity_type="application",
            created_at=applied_at,
        ))

        if stage in [StageEnum.screened, StageEnum.interview, StageEnum.offer, StageEnum.hired]:
            activities.append(Activity(
                description=f"{candidate.full_name} moved to {stage} for {job.title}",
                activity_type="stage_change",
                created_at=applied_at + timedelta(days=random.randint(1, 5)),
            ))

        # Create interview records for candidates in interview+ stages
        if stage in [StageEnum.interview, StageEnum.offer, StageEnum.hired]:
            interview_date = applied_at + timedelta(days=random.randint(3, 10))
            interview = Interview(
                application_id=app.id,
                scheduled_at=interview_date,
                duration_minutes=random.choice([30, 45, 60]),
                location=random.choice(["Video Call - Zoom", "Video Call - Google Meet", "On-site - Room 301"]),
                status="completed" if stage in [StageEnum.offer, StageEnum.hired] else "confirmed",
                candidate_selected=True,
            )
            db.add(interview)
            db.flush()

            # Create interview slots
            for slot_offset in range(3):
                slot_start = interview_date + timedelta(hours=slot_offset * 2)
                slot = InterviewSlot(
                    interview_id=interview.id,
                    start_time=slot_start,
                    end_time=slot_start + timedelta(hours=1),
                    is_selected=(slot_offset == 0),
                )
                db.add(slot)

            # Create scorecards for completed interviews
            if stage in [StageEnum.offer, StageEnum.hired]:
                recommendations = ["strong_yes", "yes", "neutral", "no", "strong_no"]
                interviewer = random.choice([recruiter, manager])
                scorecard = Scorecard(
                    application_id=app.id,
                    interviewer_id=interviewer.id,
                    technical_score=random.randint(2, 5),
                    communication_score=random.randint(3, 5),
                    culture_fit_score=random.randint(2, 5),
                    overall_score=random.randint(3, 5),
                    strengths=f"Strong background in {random.choice(areas)}. Good communicator.",
                    weaknesses=f"Could improve in {random.choice(areas)}.",
                    recommendation=random.choice(["strong_yes", "yes", "neutral"]),
                    notes=f"Interviewed for {job.title}. Overall positive impression.",
                )
                db.add(scorecard)

        # Create email logs for candidates past screening
        if stage in [StageEnum.interview, StageEnum.offer, StageEnum.hired]:
            email_log = EmailLog(
                to_email=candidate.email,
                subject=f"Interview Invitation - {job.title}",
                body=f"Dear {candidate.full_name},\n\nWe'd like to invite you for an interview for the {job.title} position.\n\nBest regards,\nHR Team",
                email_type="interview_invite",
                application_id=app.id,
                sent_by_id=recruiter.id,
            )
            db.add(email_log)

        if stage == StageEnum.offer:
            email_log = EmailLog(
                to_email=candidate.email,
                subject=f"Offer Letter - {job.title}",
                body=f"Dear {candidate.full_name},\n\nWe're pleased to extend an offer for the {job.title} position.\n\nBest regards,\nHR Team",
                email_type="offer",
                application_id=app.id,
                sent_by_id=manager.id,
            )
            db.add(email_log)

        if stage == StageEnum.rejected:
            email_log = EmailLog(
                to_email=candidate.email,
                subject=f"Application Update - {job.title}",
                body=f"Dear {candidate.full_name},\n\nThank you for your interest in the {job.title} position. After careful consideration, we've decided to move forward with other candidates.\n\nBest regards,\nHR Team",
                email_type="rejection",
                application_id=app.id,
                sent_by_id=recruiter.id,
            )
            db.add(email_log)

    db.add_all(activities)
    db.commit()
    print("Database seeded with demo data!")
