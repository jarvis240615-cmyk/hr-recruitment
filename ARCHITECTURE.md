# HR Recruitment Platform — Architecture

## System Overview

The HR Recruitment Platform is an AI-powered recruitment management system that streamlines the hiring process from job posting to candidate onboarding. It combines traditional ATS (Applicant Tracking System) functionality with AI-driven resume screening, job description generation, and candidate ranking.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React + Vite)                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Dashboard │ │   Jobs   │ │ Pipeline │ │Analytics │  ...      │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘           │
│       └─────────────┴───────────┴─────────────┘                  │
│                         Axios HTTP Client                        │
└─────────────────────────────┬───────────────────────────────────┘
                              │ REST API (JSON)
┌─────────────────────────────┴───────────────────────────────────┐
│                    Backend (FastAPI + Python)                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Middleware Layer                       │    │
│  │  CORS │ Security Headers │ Rate Limiting │ Auth (JWT)    │    │
│  └──────────────────────────┬──────────────────────────────┘    │
│  ┌──────────────────────────┴──────────────────────────────┐    │
│  │                     Router Layer                         │    │
│  │  auth │ jobs │ candidates │ applications │ interviews    │    │
│  │  scorecards │ emails │ screening │ analytics │ dashboard │    │
│  └──────────────────────────┬──────────────────────────────┘    │
│  ┌──────────────────────────┴──────────────────────────────┐    │
│  │                   AI Layer (backend/ai/)                  │    │
│  │  Screening │ RAG │ JD Generator │ Interview Q's │ Ranker │    │
│  └──────────────────────────┬──────────────────────────────┘    │
│  ┌──────────────────────────┴──────────────────────────────┐    │
│  │                   Data Layer (SQLAlchemy)                 │    │
│  │  User │ Job │ Candidate │ Application │ Interview        │    │
│  │  Scorecard │ EmailLog │ Activity                         │    │
│  └──────────────────────────┬──────────────────────────────┘    │
└─────────────────────────────┴───────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │      SQLite / PostgreSQL       │
              └───────────────────────────────┘
```

## Component Architecture

### Frontend (`frontend/`)

| Component | Path | Purpose |
|-----------|------|---------|
| App | `src/App.jsx` | Root component, routing, ErrorBoundary |
| Sidebar | `src/components/Sidebar.jsx` | Navigation sidebar |
| Dashboard | `src/pages/Dashboard.jsx` | Overview stats + activity |
| Jobs | `src/pages/Jobs.jsx` | Job CRUD + AI generation |
| Pipeline | `src/pages/Pipeline.jsx` | Kanban board for applications |
| Candidates | `src/pages/Candidates.jsx` | Candidate listing + search |
| Analytics | `src/pages/Analytics.jsx` | Charts: funnel, time-to-hire, sources |
| Scorecards | `src/pages/Scorecards.jsx` | Interview evaluation forms |
| Apply | `src/pages/Apply.jsx` | Public job application form |
| ErrorBoundary | `src/components/ErrorBoundary.jsx` | Global error catching |
| Toast | via `react-hot-toast` | Notification system |

### Backend (`backend/`)

| Module | Path | Purpose |
|--------|------|---------|
| main.py | `backend/main.py` | FastAPI app, middleware, startup |
| auth.py | `backend/auth.py` | JWT auth, password hashing, RBAC |
| models.py | `backend/models.py` | SQLAlchemy ORM models |
| database.py | `backend/database.py` | DB engine + session factory |
| seed.py | `backend/seed.py` | Demo data seeding |
| utils/errors.py | `backend/utils/errors.py` | Standardized API error responses |
| utils/sanitize.py | `backend/utils/sanitize.py` | Input sanitization |
| utils/pagination.py | `backend/utils/pagination.py` | Paginated response model |

### AI Layer (`backend/ai/`)

| Module | Purpose |
|--------|---------|
| screening.py | Resume scoring with Claude + RAG context |
| rag.py | ChromaDB-based decision storage + retrieval |
| jd_generator.py | AI job description generation |
| interview_questions.py | Tailored interview question generation |
| ranker.py | Parallel candidate ranking |
| export_training_data.py | Export decisions for fine-tuning |

## Data Flow

### Application Submission Flow
1. Candidate submits via `POST /api/applications/apply/{job_id}` (public, rate-limited)
2. Input is sanitized (HTML stripped, length enforced)
3. Resume file is validated (MIME type + magic bytes)
4. Candidate and Application records are created
5. Background task triggers AI screening
6. AI layer scores resume (0-100) using Claude + RAG
7. Score and reasoning are stored on Application record
8. Activity log entry is created

### Pipeline Management Flow
1. Recruiter views pipeline via `GET /api/applications/pipeline`
2. Applications are grouped by stage (Applied → Screened → Interview → Offer → Hired)
3. Stage changes via `PUT /api/applications/{id}/stage`
4. Activity log tracks all transitions

## Security Architecture

- **Authentication**: JWT tokens with 24h expiry
- **Authorization**: Role-based (admin, recruiter, hiring_manager)
- **Rate Limiting**: In-memory token bucket on login (5/min) and apply (3/min)
- **Input Sanitization**: HTML tag stripping, length enforcement on all public inputs
- **File Validation**: MIME type check + magic bytes verification
- **Security Headers**: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy
- **CORS**: Configurable allowed origins

## API Design

- **Pagination**: `PaginatedResponse` envelope on list endpoints (`{items, total, page, limit, pages}`)
- **Error Format**: Standardized `{error, message, details, timestamp, path}`
- **OpenAPI**: Full metadata with tag descriptions for Swagger UI

## Extension Points

1. **Database**: Swap SQLite for PostgreSQL via `DATABASE_URL` env var
2. **AI Provider**: Replace Claude with any LLM by modifying `backend/ai/` modules
3. **Email Service**: Integrate SMTP/SendGrid in `routers/emails.py` (currently logs only)
4. **File Storage**: Replace local uploads with S3/GCS in `routers/applications.py`
5. **Search**: Add Elasticsearch for candidate/job full-text search
6. **SSO**: Add OAuth2 providers (Google, Okta) in `auth.py`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 6, TailwindCSS 4, Recharts, Axios |
| Backend | Python, FastAPI, SQLAlchemy, Pydantic |
| AI | Anthropic Claude, ChromaDB, sentence-transformers |
| Auth | JWT (python-jose), bcrypt (passlib) |
| Database | SQLite (dev), PostgreSQL (prod) |
| Testing | pytest, httpx, pytest-asyncio |
