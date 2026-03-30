import pytest


class TestListCandidates:
    def test_list_candidates_empty(self, client, auth_headers):
        response = client.get("/api/candidates", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["items"] == []
        assert data["total"] == 0

    def test_list_candidates_with_data(self, client, auth_headers, sample_candidate):
        response = client.get("/api/candidates", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1
        assert any(c["full_name"] == "Jane Doe" for c in data["items"])

    def test_list_candidates_unauthenticated(self, client):
        response = client.get("/api/candidates")
        assert response.status_code == 401

    def test_list_candidates_pagination(self, client, auth_headers, db_session):
        import models

        for i in range(5):
            c = models.Candidate(
                full_name=f"Candidate {i}",
                email=f"candidate{i}@example.com",
            )
            db_session.add(c)
        db_session.commit()

        response = client.get("/api/candidates?page=1&limit=2", headers=auth_headers)
        data = response.json()
        assert len(data["items"]) == 2
        assert data["total"] == 5


class TestGetCandidate:
    def test_get_candidate_success(self, client, auth_headers, sample_candidate):
        response = client.get(
            f"/api/candidates/{sample_candidate.id}", headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["full_name"] == "Jane Doe"
        assert data["email"] == "jane@example.com"

    def test_get_candidate_not_found(self, client, auth_headers):
        response = client.get("/api/candidates/9999", headers=auth_headers)
        assert response.status_code == 404

    def test_get_candidate_unauthenticated(self, client, sample_candidate):
        response = client.get(f"/api/candidates/{sample_candidate.id}")
        assert response.status_code == 401

    def test_get_candidate_with_applications(
        self, client, auth_headers, sample_application
    ):
        candidate_id = sample_application.candidate_id
        response = client.get(
            f"/api/candidates/{candidate_id}", headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["applications"]) >= 1
        assert data["applications"][0]["job_title"] == "Software Engineer"
