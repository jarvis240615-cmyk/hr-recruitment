import pytest


class TestListEmails:
    def test_list_emails_empty(self, client, auth_headers):
        response = client.get("/api/emails", headers=auth_headers)
        assert response.status_code == 200
        assert response.json() == []

    def test_list_emails_unauthenticated(self, client):
        response = client.get("/api/emails")
        assert response.status_code == 401


class TestSendEmail:
    def test_send_email_success(self, client, auth_headers):
        response = client.post(
            "/api/emails",
            json={
                "to_email": "candidate@example.com",
                "subject": "Interview Invitation",
                "body": "We'd like to invite you for an interview.",
                "email_type": "interview_invite",
            },
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Email logged successfully"
        assert data["to_email"] == "candidate@example.com"
        assert data["email_type"] == "interview_invite"

    def test_send_email_with_application(
        self, client, auth_headers, sample_application
    ):
        response = client.post(
            "/api/emails",
            json={
                "to_email": "candidate@example.com",
                "subject": "Offer Letter",
                "body": "Congratulations!",
                "email_type": "offer",
                "application_id": sample_application.id,
            },
            headers=auth_headers,
        )
        assert response.status_code == 200

    def test_send_email_nonexistent_application(self, client, auth_headers):
        response = client.post(
            "/api/emails",
            json={
                "to_email": "candidate@example.com",
                "subject": "Test",
                "body": "Test",
                "email_type": "follow_up",
                "application_id": 9999,
            },
            headers=auth_headers,
        )
        assert response.status_code == 404

    def test_send_email_unauthenticated(self, client):
        response = client.post(
            "/api/emails",
            json={
                "to_email": "test@test.com",
                "subject": "Test",
                "body": "Test",
                "email_type": "rejection",
            },
        )
        assert response.status_code == 401


class TestGetEmail:
    def test_get_email_success(self, client, auth_headers):
        create_resp = client.post(
            "/api/emails",
            json={
                "to_email": "test@example.com",
                "subject": "Follow Up",
                "body": "Just checking in.",
                "email_type": "follow_up",
            },
            headers=auth_headers,
        )
        email_id = create_resp.json()["id"]

        response = client.get(f"/api/emails/{email_id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["to_email"] == "test@example.com"
        assert data["subject"] == "Follow Up"
        assert data["body"] == "Just checking in."

    def test_get_email_not_found(self, client, auth_headers):
        response = client.get("/api/emails/9999", headers=auth_headers)
        assert response.status_code == 404

    def test_filter_emails_by_application(
        self, client, auth_headers, sample_application
    ):
        client.post(
            "/api/emails",
            json={
                "to_email": "test@example.com",
                "subject": "Test",
                "body": "Test body",
                "email_type": "interview_invite",
                "application_id": sample_application.id,
            },
            headers=auth_headers,
        )

        response = client.get(
            f"/api/emails?application_id={sample_application.id}",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
