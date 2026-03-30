import pytest


class TestDashboardStats:
    def test_get_stats_empty(self, client, auth_headers):
        response = client.get("/api/dashboard/stats", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "open_jobs" in data
        assert "total_candidates" in data
        assert "total_applications" in data
        assert "stage_counts" in data
        assert "avg_ai_score" in data

    def test_get_stats_with_data(
        self, client, auth_headers, sample_application, sample_job
    ):
        response = client.get("/api/dashboard/stats", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["open_jobs"] >= 1
        assert data["total_candidates"] >= 1
        assert data["total_applications"] >= 1
        assert data["stage_counts"]["Applied"] >= 1

    def test_get_stats_unauthenticated(self, client):
        response = client.get("/api/dashboard/stats")
        assert response.status_code == 401


class TestRecentActivity:
    def test_recent_activity_empty(self, client, auth_headers):
        response = client.get("/api/dashboard/recent-activity", headers=auth_headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_recent_activity_with_limit(self, client, auth_headers):
        response = client.get(
            "/api/dashboard/recent-activity?limit=5", headers=auth_headers
        )
        assert response.status_code == 200

    def test_recent_activity_unauthenticated(self, client):
        response = client.get("/api/dashboard/recent-activity")
        assert response.status_code == 401
