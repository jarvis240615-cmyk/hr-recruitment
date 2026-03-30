import pytest


class TestListScorecards:
    def test_list_scorecards_empty(self, client, auth_headers):
        response = client.get("/api/scorecards", headers=auth_headers)
        assert response.status_code == 200
        assert response.json() == []

    def test_list_scorecards_unauthenticated(self, client):
        response = client.get("/api/scorecards")
        assert response.status_code == 401


class TestCreateScorecard:
    def test_create_scorecard_success(self, client, auth_headers, sample_application):
        response = client.post(
            "/api/scorecards",
            json={
                "application_id": sample_application.id,
                "technical_score": 4,
                "communication_score": 5,
                "culture_fit_score": 3,
                "overall_score": 4,
                "strengths": "Strong Python skills",
                "weaknesses": "Limited cloud experience",
                "recommendation": "yes",
                "notes": "Good candidate overall",
            },
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["overall_score"] == 4
        assert data["recommendation"] == "yes"

    def test_create_scorecard_invalid_score_too_high(
        self, client, auth_headers, sample_application
    ):
        response = client.post(
            "/api/scorecards",
            json={
                "application_id": sample_application.id,
                "technical_score": 6,
                "communication_score": 5,
                "culture_fit_score": 3,
                "overall_score": 4,
                "recommendation": "yes",
            },
            headers=auth_headers,
        )
        assert response.status_code == 422

    def test_create_scorecard_invalid_score_too_low(
        self, client, auth_headers, sample_application
    ):
        response = client.post(
            "/api/scorecards",
            json={
                "application_id": sample_application.id,
                "technical_score": 0,
                "communication_score": 5,
                "culture_fit_score": 3,
                "overall_score": 4,
                "recommendation": "yes",
            },
            headers=auth_headers,
        )
        assert response.status_code == 422

    def test_create_scorecard_nonexistent_application(self, client, auth_headers):
        response = client.post(
            "/api/scorecards",
            json={
                "application_id": 9999,
                "technical_score": 4,
                "communication_score": 5,
                "culture_fit_score": 3,
                "overall_score": 4,
                "recommendation": "yes",
            },
            headers=auth_headers,
        )
        assert response.status_code == 404

    def test_create_scorecard_unauthenticated(self, client, sample_application):
        response = client.post(
            "/api/scorecards",
            json={
                "application_id": sample_application.id,
                "technical_score": 4,
                "communication_score": 5,
                "culture_fit_score": 3,
                "overall_score": 4,
                "recommendation": "yes",
            },
        )
        assert response.status_code == 401


class TestGetScorecard:
    def test_get_scorecard_success(self, client, auth_headers, sample_application):
        create_resp = client.post(
            "/api/scorecards",
            json={
                "application_id": sample_application.id,
                "technical_score": 4,
                "communication_score": 5,
                "culture_fit_score": 3,
                "overall_score": 4,
                "recommendation": "strong_yes",
            },
            headers=auth_headers,
        )
        scorecard_id = create_resp.json()["id"]

        response = client.get(
            f"/api/scorecards/{scorecard_id}", headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["technical_score"] == 4
        assert data["recommendation"] == "strong_yes"

    def test_get_scorecard_not_found(self, client, auth_headers):
        response = client.get("/api/scorecards/9999", headers=auth_headers)
        assert response.status_code == 404


class TestUpdateScorecard:
    def test_update_own_scorecard(self, client, auth_headers, sample_application):
        create_resp = client.post(
            "/api/scorecards",
            json={
                "application_id": sample_application.id,
                "technical_score": 3,
                "communication_score": 3,
                "culture_fit_score": 3,
                "overall_score": 3,
                "recommendation": "neutral",
            },
            headers=auth_headers,
        )
        scorecard_id = create_resp.json()["id"]

        response = client.put(
            f"/api/scorecards/{scorecard_id}",
            json={"overall_score": 5, "recommendation": "strong_yes"},
            headers=auth_headers,
        )
        assert response.status_code == 200

    def test_update_other_scorecard_as_non_admin(
        self, client, auth_headers, recruiter_headers, sample_application
    ):
        # Admin creates scorecard
        create_resp = client.post(
            "/api/scorecards",
            json={
                "application_id": sample_application.id,
                "technical_score": 3,
                "communication_score": 3,
                "culture_fit_score": 3,
                "overall_score": 3,
                "recommendation": "neutral",
            },
            headers=auth_headers,
        )
        scorecard_id = create_resp.json()["id"]

        # Recruiter tries to update it
        response = client.put(
            f"/api/scorecards/{scorecard_id}",
            json={"overall_score": 1},
            headers=recruiter_headers,
        )
        assert response.status_code == 403

    def test_update_scorecard_not_found(self, client, auth_headers):
        response = client.put(
            "/api/scorecards/9999",
            json={"overall_score": 5},
            headers=auth_headers,
        )
        assert response.status_code == 404

    def test_filter_scorecards_by_application(
        self, client, auth_headers, sample_application
    ):
        client.post(
            "/api/scorecards",
            json={
                "application_id": sample_application.id,
                "technical_score": 4,
                "communication_score": 4,
                "culture_fit_score": 4,
                "overall_score": 4,
                "recommendation": "yes",
            },
            headers=auth_headers,
        )

        response = client.get(
            f"/api/scorecards?application_id={sample_application.id}",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert all(s["application_id"] == sample_application.id for s in data)
