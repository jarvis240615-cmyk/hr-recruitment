import pytest


class TestAnalyticsOverview:
    def test_overview_empty(self, client, auth_headers):
        response = client.get("/api/analytics/overview", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "total_jobs" in data
        assert "total_candidates" in data
        assert "total_applications" in data
        assert "total_interviews" in data
        assert "pipeline" in data
        assert "avg_ai_score" in data

    def test_overview_with_data(self, client, auth_headers, sample_application):
        response = client.get("/api/analytics/overview", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["total_applications"] >= 1

    def test_overview_unauthenticated(self, client):
        response = client.get("/api/analytics/overview")
        assert response.status_code == 401


class TestPipelineAnalytics:
    def test_pipeline_empty(self, client, auth_headers):
        response = client.get("/api/analytics/pipeline", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "pipeline" in data
        stages = [s["stage"] for s in data["pipeline"]]
        assert "Applied" in stages
        assert "Hired" in stages

    def test_pipeline_with_data(self, client, auth_headers, sample_application):
        response = client.get("/api/analytics/pipeline", headers=auth_headers)
        data = response.json()
        applied = next(s for s in data["pipeline"] if s["stage"] == "Applied")
        assert applied["count"] >= 1


class TestJobAnalytics:
    def test_job_analytics_empty(self, client, auth_headers):
        response = client.get("/api/analytics/jobs", headers=auth_headers)
        assert response.status_code == 200
        assert "jobs" in response.json()

    def test_job_analytics_with_data(
        self, client, auth_headers, sample_application, sample_job
    ):
        response = client.get("/api/analytics/jobs", headers=auth_headers)
        data = response.json()
        assert len(data["jobs"]) >= 1
        job = data["jobs"][0]
        assert "title" in job
        assert "application_count" in job
        assert "avg_ai_score" in job


class TestScorecardAnalytics:
    def test_scorecard_analytics_empty(self, client, auth_headers):
        response = client.get("/api/analytics/scorecards", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["total_scorecards"] == 0

    def test_scorecard_analytics_unauthenticated(self, client):
        response = client.get("/api/analytics/scorecards")
        assert response.status_code == 401


class TestEmailAnalytics:
    def test_email_analytics_empty(self, client, auth_headers):
        response = client.get("/api/analytics/emails", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["total_emails"] == 0

    def test_email_analytics_unauthenticated(self, client):
        response = client.get("/api/analytics/emails")
        assert response.status_code == 401


class TestTimeToHire:
    def test_time_to_hire_empty(self, client, auth_headers):
        response = client.get("/api/analytics/time-to-hire", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["overall_avg_days"] == 0
        assert data["per_job"] == []

    def test_time_to_hire_unauthenticated(self, client):
        response = client.get("/api/analytics/time-to-hire")
        assert response.status_code == 401
