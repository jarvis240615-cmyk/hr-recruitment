from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
import enum


class RoleEnum(str, enum.Enum):
    admin = "admin"
    recruiter = "recruiter"
    hiring_manager = "hiring_manager"


class StageEnum(str, enum.Enum):
    applied = "Applied"
    screened = "Screened"
    interview = "Interview"
    offer = "Offer"
    hired = "Hired"
    rejected = "Rejected"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default=RoleEnum.recruiter)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Job(Base):
    __tablename__ = "jobs"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    department = Column(String, nullable=False)
    location = Column(String, default="Remote")
    description = Column(Text, nullable=False)
    requirements = Column(Text, nullable=False)
    salary_range = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    applications = relationship("Application", back_populates="job")


class Candidate(Base):
    __tablename__ = "candidates"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String)
    resume_path = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    applications = relationship("Application", back_populates="candidate")


class Application(Base):
    __tablename__ = "applications"
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    stage = Column(String, default=StageEnum.applied)
    ai_score = Column(Float)
    ai_reasoning = Column(Text)
    cover_letter = Column(Text)
    applied_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    job = relationship("Job", back_populates="applications")
    candidate = relationship("Candidate", back_populates="applications")
    interviews = relationship("Interview", back_populates="application")


class Interview(Base):
    __tablename__ = "interviews"
    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    scheduled_at = Column(DateTime)
    duration_minutes = Column(Integer, default=60)
    location = Column(String, default="Video Call")
    notes = Column(Text)
    status = Column(String, default="pending")  # pending, confirmed, completed, cancelled
    available_slots = Column(Text)  # JSON string of available slots
    candidate_selected = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    application = relationship("Application", back_populates="interviews")


class InterviewSlot(Base):
    __tablename__ = "interview_slots"
    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id"), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    is_selected = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    interview = relationship("Interview", backref="slots")


class Scorecard(Base):
    __tablename__ = "scorecards"
    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    interviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    technical_score = Column(Integer)  # 1-5
    communication_score = Column(Integer)  # 1-5
    culture_fit_score = Column(Integer)  # 1-5
    overall_score = Column(Integer)  # 1-5
    strengths = Column(Text)
    weaknesses = Column(Text)
    recommendation = Column(String)  # strong_yes, yes, neutral, no, strong_no
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    application = relationship("Application", backref="scorecards")
    interviewer = relationship("User", backref="scorecards")


class EmailLog(Base):
    __tablename__ = "email_logs"
    id = Column(Integer, primary_key=True, index=True)
    to_email = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    body = Column(Text, nullable=False)
    email_type = Column(String, nullable=False)  # interview_invite, rejection, offer, follow_up
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=True)
    sent_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    sent_at = Column(DateTime, default=datetime.utcnow)
    application = relationship("Application", backref="email_logs")
    sent_by = relationship("User", backref="sent_emails")


class Activity(Base):
    __tablename__ = "activities"
    id = Column(Integer, primary_key=True, index=True)
    description = Column(Text, nullable=False)
    activity_type = Column(String, nullable=False)  # application, stage_change, interview, screening
    created_at = Column(DateTime, default=datetime.utcnow)
