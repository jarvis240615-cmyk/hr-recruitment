import pytest
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from database import Base, get_db
from auth import get_password_hash
import models


@pytest.fixture(scope="function")
def db_engine():
    """Create a fresh in-memory SQLite engine for each test."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session(db_engine):
    """Create a session bound to the test engine."""
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=db_engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(scope="function")
def client(db_session):
    """FastAPI test client with overridden database dependency."""
    from main import app, _rate_limit_store

    # Clear rate limiter between tests
    _rate_limit_store.clear()

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def admin_user(db_session):
    """Create an admin user for testing."""
    user = models.User(
        email="admin@test.com",
        hashed_password=get_password_hash("adminpass123"),
        full_name="Test Admin",
        role="admin",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def recruiter_user(db_session):
    """Create a recruiter user for testing."""
    user = models.User(
        email="recruiter@test.com",
        hashed_password=get_password_hash("recruiterpass123"),
        full_name="Test Recruiter",
        role="recruiter",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def auth_headers(client, admin_user):
    """Get auth headers for admin user."""
    response = client.post(
        "/api/auth/login",
        data={"username": "admin@test.com", "password": "adminpass123"},
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def recruiter_headers(client, recruiter_user):
    """Get auth headers for recruiter user."""
    response = client.post(
        "/api/auth/login",
        data={"username": "recruiter@test.com", "password": "recruiterpass123"},
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def sample_job(db_session):
    """Create a sample job for testing."""
    job = models.Job(
        title="Software Engineer",
        department="Engineering",
        location="Remote",
        description="Build great software.",
        requirements="3+ years Python experience.",
        salary_range="$120k-$160k",
        is_active=True,
    )
    db_session.add(job)
    db_session.commit()
    db_session.refresh(job)
    return job


@pytest.fixture
def sample_candidate(db_session):
    """Create a sample candidate for testing."""
    candidate = models.Candidate(
        full_name="Jane Doe",
        email="jane@example.com",
        phone="555-1234",
    )
    db_session.add(candidate)
    db_session.commit()
    db_session.refresh(candidate)
    return candidate


@pytest.fixture
def sample_application(db_session, sample_job, sample_candidate):
    """Create a sample application for testing."""
    application = models.Application(
        job_id=sample_job.id,
        candidate_id=sample_candidate.id,
        stage="Applied",
        cover_letter="I am interested in this position.",
        ai_score=85.5,
        ai_reasoning="Strong candidate with relevant experience.",
    )
    db_session.add(application)
    db_session.commit()
    db_session.refresh(application)
    return application
