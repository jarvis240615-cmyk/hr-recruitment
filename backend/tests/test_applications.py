import pytest
import io


class TestListApplications:
    def test_list_applications_empty(self, client, auth_headers):
        response = client.get("/api/applications", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["items"] == []

    def test_list_applications_with_data(self, client, auth_headers, sample_application):
        response = client.get("/api/applications", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1

    def test_list_applications_unauthenticated(self, client):
        response = client.get("/api/applications")
        assert response.status_code == 401


class TestPublicApply:
    def test_apply_success(self, client, sample_job):
        response = client.post(
            f"/api/applications/apply/{sample_job.id}",
            data={
                "full_name": "John Smith",
                "email": "john@example.com",
                "phone": "555-9999",
                "cover_letter": "I want this job.",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Application submitted successfully"
        assert "application_id" in data

    def test_apply_nonexistent_job(self, client):
        response = client.post(
            "/api/applications/apply/9999",
            data={
                "full_name": "John Smith",
                "email": "john@example.com",
            },
        )
        assert response.status_code == 404

    def test_apply_duplicate(self, client, sample_job, sample_candidate):
        import models
        # sample_candidate already has an application via sample_application fixture
        # Create an application first
        client.post(
            f"/api/applications/apply/{sample_job.id}",
            data={
                "full_name": "Jane Doe",
                "email": "jane@example.com",
                "phone": "555-1234",
                "cover_letter": "First application.",
            },
        )
        # Try to apply again
        response = client.post(
            f"/api/applications/apply/{sample_job.id}",
            data={
                "full_name": "Jane Doe",
                "email": "jane@example.com",
                "phone": "555-1234",
                "cover_letter": "Second application.",
            },
        )
        assert response.status_code == 400

    def test_apply_with_long_name_gets_truncated(self, client, sample_job):
        long_name = "A" * 200
        response = client.post(
            f"/api/applications/apply/{sample_job.id}",
            data={
                "full_name": long_name,
                "email": "longname@example.com",
                "cover_letter": "Test",
            },
        )
        assert response.status_code == 200

    def test_apply_with_html_in_cover_letter(self, client, sample_job):
        response = client.post(
            f"/api/applications/apply/{sample_job.id}",
            data={
                "full_name": "Test User",
                "email": "htmltest@example.com",
                "cover_letter": "<script>alert('xss')</script>I am interested",
            },
        )
        assert response.status_code == 200


class TestUpdateStage:
    def test_update_stage_success(self, client, auth_headers, sample_application):
        response = client.put(
            f"/api/applications/{sample_application.id}/stage",
            json={"stage": "Screened"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        assert response.json()["stage"] == "Screened"

    def test_update_stage_invalid(self, client, auth_headers, sample_application):
        response = client.put(
            f"/api/applications/{sample_application.id}/stage",
            json={"stage": "InvalidStage"},
            headers=auth_headers,
        )
        assert response.status_code == 422

    def test_update_stage_not_found(self, client, auth_headers):
        response = client.put(
            "/api/applications/9999/stage",
            json={"stage": "Screened"},
            headers=auth_headers,
        )
        assert response.status_code == 404


class TestGetApplication:
    def test_get_application_success(self, client, auth_headers, sample_application):
        response = client.get(
            f"/api/applications/{sample_application.id}",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["stage"] == "Applied"
        assert data["ai_score"] == 85.5

    def test_get_application_not_found(self, client, auth_headers):
        response = client.get("/api/applications/9999", headers=auth_headers)
        assert response.status_code == 404
