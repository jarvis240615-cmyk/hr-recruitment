import pytest


class TestRescore:
    def test_rescore_success(self, client, auth_headers, sample_application):
        response = client.post(
            f"/api/screening/{sample_application.id}/rescore",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert "ai_score" in data
        assert "ai_reasoning" in data
        assert isinstance(data["ai_score"], (int, float))
        assert 0 <= data["ai_score"] <= 100

    def test_rescore_nonexistent_application(self, client, auth_headers):
        response = client.post(
            "/api/screening/9999/rescore",
            headers=auth_headers,
        )
        assert response.status_code == 404

    def test_rescore_unauthenticated(self, client, sample_application):
        response = client.post(
            f"/api/screening/{sample_application.id}/rescore",
        )
        assert response.status_code == 401

    def test_rescore_forbidden_for_hiring_manager(
        self, client, db_session, sample_application
    ):
        from auth import get_password_hash
        import models

        hm = models.User(
            email="hm@test.com",
            hashed_password=get_password_hash("hmpass123"),
            full_name="Hiring Manager",
            role="hiring_manager",
        )
        db_session.add(hm)
        db_session.commit()

        login_resp = client.post(
            "/api/auth/login",
            data={"username": "hm@test.com", "password": "hmpass123"},
        )
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        response = client.post(
            f"/api/screening/{sample_application.id}/rescore",
            headers=headers,
        )
        assert response.status_code == 403
