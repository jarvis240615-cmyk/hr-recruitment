# HR Recruitment Platform — Frontend

React-based UI for the HR recruitment platform with dashboard, pipeline management, and analytics.

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

## Environment

The frontend connects to the backend API at `http://localhost:8000` (configured in `src/api/axios.js` and proxied via Vite dev server).

## Build

```bash
npm run build
```

Output goes to `dist/`.

## Tech Stack

- **React 19** — UI framework
- **Vite 6** — Build tool
- **TailwindCSS 4** — Utility-first CSS
- **Recharts** — Charts and data visualization
- **Axios** — HTTP client
- **react-hot-toast** — Toast notifications
- **react-router-dom** — Client-side routing

## Project Structure

```
frontend/
├── public/             # Static assets
├── src/
│   ├── api/            # Axios client + mock data
│   ├── components/     # Reusable components
│   │   ├── EmailModal.jsx
│   │   ├── EmptyState.jsx
│   │   ├── ErrorBoundary.jsx
│   │   ├── KanbanCard.jsx
│   │   ├── ScoreBar.jsx
│   │   ├── Sidebar.jsx
│   │   └── SkeletonLoader.jsx
│   ├── pages/          # Route pages
│   │   ├── Analytics.jsx
│   │   ├── Apply.jsx
│   │   ├── CandidateDetail.jsx
│   │   ├── Candidates.jsx
│   │   ├── Dashboard.jsx
│   │   ├── JobDetail.jsx
│   │   ├── Jobs.jsx
│   │   ├── Login.jsx
│   │   ├── Pipeline.jsx
│   │   └── Scorecards.jsx
│   ├── App.jsx         # Root component
│   ├── main.jsx        # Entry point
│   └── index.css       # Tailwind imports
├── package.json
└── vite.config.js
```

## Features

- Dashboard with live stats and recent activity
- Job management with AI description generation
- Kanban pipeline with drag-and-drop
- Candidate search and filtering by AI score
- Interview scorecard submission
- Email templates (Interview, Offer, Rejection, Shortlist)
- Analytics with funnel, time-to-hire, and source charts
- Public job application portal
- Toast notifications for all actions
- Loading skeletons and empty states
- Error boundary for graceful error handling
