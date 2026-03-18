import pytest


class TestListJobs:
    def test_list_jobs_empty(self, client):
        response = client.get("/api/jobs")
        assert response.status_code == 200
        data = response.json()
        assert data["items"] == []
        assert data["total"] == 0

    def test_list_jobs_with_data(self, client, sample_job):
        response = client.get("/api/jobs")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1
        assert any(j["title"] == "Software Engineer" for j in data["items"])

    def test_list_jobs_pagination(self, client, db_session):
        import models
        for i in range(5):
            job = models.Job(title=f"Job {i}", department="Eng", description="Desc", requirements="Reqs")
            db_session.add(job)
        db_session.commit()

        response = client.get("/api/jobs?page=1&limit=2")
        data = response.json()
        assert len(data["items"]) == 2
        assert data["total"] == 5
        assert data["pages"] == 3


class TestGetJob:
    def test_get_job_success(self, client, sample_job):
        response = client.get(f"/api/jobs/{sample_job.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Software Engineer"
        assert data["department"] == "Engineering"

    def test_get_job_not_found(self, client):
        response = client.get("/api/jobs/9999")
        assert response.status_code == 404


class TestCreateJob:
    def test_create_job_as_admin(self, client, auth_headers):
        response = client.post(
            "/api/jobs",
            json={
                "title": "Data Engineer",
                "department": "Data",
                "description": "Build data pipelines",
                "requirements": "Python, SQL, Spark",
            },
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Data Engineer"
        assert data["is_active"] == True

    def test_create_job_unauthenticated(self, client):
        response = client.post(
            "/api/jobs",
            json={
                "title": "Test",
                "department": "Test",
                "description": "Test",
                "requirements": "Test",
            },
        )
        assert response.status_code == 401


class TestUpdateJob:
    def test_update_job(self, client, auth_headers, sample_job):
        response = client.put(
            f"/api/jobs/{sample_job.id}",
            json={"title": "Senior Software Engineer"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        assert response.json()["title"] == "Senior Software Engineer"

    def test_update_nonexistent_job(self, client, auth_headers):
        response = client.put(
            "/api/jobs/9999",
            json={"title": "Nope"},
            headers=auth_headers,
        )
        assert response.status_code == 404


class TestDeleteJob:
    def test_delete_job(self, client, auth_headers, sample_job):
        response = client.delete(f"/api/jobs/{sample_job.id}", headers=auth_headers)
        assert response.status_code == 200

        response = client.get(f"/api/jobs/{sample_job.id}")
        assert response.status_code == 404

    def test_delete_nonexistent_job(self, client, auth_headers):
        response = client.delete("/api/jobs/9999", headers=auth_headers)
        assert response.status_code == 404
