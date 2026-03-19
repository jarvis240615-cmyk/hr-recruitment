# HR Recruitment Platform — Backend

FastAPI-powered REST API for the HR recruitment platform with AI screening, interview management, and analytics.

## Quick Start

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.
Swagger docs at `http://localhost:8000/docs`.

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SECRET_KEY` | Yes (prod) | dev default | JWT signing secret |
| `DATABASE_URL` | No | `sqlite:///./hr_recruitment.db` | Database connection string |
| `CORS_ORIGINS` | No | `http://localhost:5173,http://localhost:3000` | Allowed CORS origins |
| `ANTHROPIC_API_KEY` | No | None | Anthropic API key for AI features |

## API Endpoints

### Auth (`/api/auth`)
- `POST /login` — Authenticate user (rate limited: 5/min)
- `POST /register` — Create user (admin only)
- `GET /me` — Get current user profile

### Jobs (`/api/jobs`)
- `GET /` — List jobs (paginated)
- `GET /public` — List active jobs (public)
- `POST /` — Create job
- `PUT /{id}` — Update job
- `DELETE /{id}` — Delete job
- `POST /generate-description` — AI-generated job description

### Candidates (`/api/candidates`)
- `GET /` — List candidates (paginated)
- `GET /{id}` — Get candidate details

### Applications (`/api/applications`)
- `GET /` — List applications (paginated)
- `GET /pipeline` — Kanban pipeline view
- `PUT /{id}/stage` — Update application stage
- `POST /apply/{job_id}` — Public apply (rate limited: 3/min)
- `GET /{id}` — Get application details

### Interviews (`/api/interviews`)
- `GET /` — List interviews
- `POST /` — Create interview with slots
- `GET /{id}/slots` — Get available slots
- `POST /{id}/select-slot` — Select interview slot
- `PUT /{id}/notes` — Update interview notes

### Scorecards (`/api/scorecards`)
- `GET /` — List scorecards
- `POST /` — Submit scorecard (1-5 scales)
- `GET /{id}` — Get scorecard
- `PUT /{id}` — Update scorecard

### Emails (`/api/emails`)
- `GET /` — List email logs
- `POST /` — Log/send email
- `GET /{id}` — Get email details

### Analytics (`/api/analytics`)
- `GET /overview` — Overall statistics
- `GET /pipeline` — Pipeline breakdown
- `GET /jobs` — Per-job analytics
- `GET /scorecards` — Scorecard analytics
- `GET /emails` — Email analytics
- `GET /time-to-hire` — Time-to-hire metrics

### Health
- `GET /api/health` — Health check

## Running Tests

```bash
cd backend
pip install -r requirements.txt
pytest tests/ -v
```

## Project Structure

```
backend/
├── ai/                 # AI modules (screening, RAG, JD generation)
├── routers/            # API route handlers
├── tests/              # Test suite
├── utils/              # Shared utilities
├── auth.py             # Authentication & authorization
├── database.py         # Database configuration
├── main.py             # FastAPI application
├── models.py           # SQLAlchemy models
├── seed.py             # Demo data seeder
└── requirements.txt    # Python dependencies
```
# Thu Mar 19 15:03:35 UTC 2026
