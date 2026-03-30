import pytest
from datetime import datetime, timedelta


class TestListInterviews:
    def test_list_interviews_empty(self, client, auth_headers):
        response = client.get("/api/interviews", headers=auth_headers)
        assert response.status_code == 200
        assert response.json() == []

    def test_list_interviews_unauthenticated(self, client):
        response = client.get("/api/interviews")
        assert response.status_code == 401


class TestCreateInterview:
    def test_create_interview_success(self, client, auth_headers, sample_application):
        slots = [
            (datetime.now() + timedelta(days=1)).isoformat(),
            (datetime.now() + timedelta(days=2)).isoformat(),
        ]
        response = client.post(
            "/api/interviews",
            json={
                "application_id": sample_application.id,
                "available_slots": slots,
                "duration_minutes": 45,
                "location": "Zoom",
            },
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["application_id"] == sample_application.id
        assert data["duration_minutes"] == 45
        assert data["location"] == "Zoom"
        assert data["status"] == "pending"
        assert len(data["available_slots"]) == 2

    def test_create_interview_nonexistent_application(self, client, auth_headers):
        response = client.post(
            "/api/interviews",
            json={
                "application_id": 9999,
                "available_slots": [datetime.now().isoformat()],
            },
            headers=auth_headers,
        )
        assert response.status_code == 404

    def test_create_interview_unauthenticated(self, client, sample_application):
        response = client.post(
            "/api/interviews",
            json={
                "application_id": sample_application.id,
                "available_slots": [datetime.now().isoformat()],
            },
        )
        assert response.status_code == 401


class TestGetInterviewSlots:
    def test_get_slots_success(self, client, auth_headers, sample_application):
        slot_time = (datetime.now() + timedelta(days=1)).isoformat()
        create_resp = client.post(
            "/api/interviews",
            json={
                "application_id": sample_application.id,
                "available_slots": [slot_time],
            },
            headers=auth_headers,
        )
        interview_id = create_resp.json()["id"]

        response = client.get(f"/api/interviews/{interview_id}/slots")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == interview_id
        assert len(data["slots"]) == 1
        assert data["status"] == "pending"

    def test_get_slots_not_found(self, client):
        response = client.get("/api/interviews/9999/slots")
        assert response.status_code == 404


class TestSelectSlot:
    def test_select_slot_success(self, client, auth_headers, sample_application):
        slot_time = (datetime.now() + timedelta(days=1)).replace(microsecond=0)
        slot_iso = slot_time.isoformat()
        create_resp = client.post(
            "/api/interviews",
            json={
                "application_id": sample_application.id,
                "available_slots": [slot_iso],
            },
            headers=auth_headers,
        )
        interview_id = create_resp.json()["id"]

        response = client.post(
            f"/api/interviews/{interview_id}/select-slot",
            json={"slot": slot_iso},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Interview slot confirmed"
        assert "scheduled_at" in data

    def test_select_slot_already_selected(
        self, client, auth_headers, sample_application
    ):
        slot_time = (datetime.now() + timedelta(days=1)).replace(microsecond=0)
        slot_iso = slot_time.isoformat()
        create_resp = client.post(
            "/api/interviews",
            json={
                "application_id": sample_application.id,
                "available_slots": [slot_iso],
            },
            headers=auth_headers,
        )
        interview_id = create_resp.json()["id"]

        # Select once
        client.post(
            f"/api/interviews/{interview_id}/select-slot",
            json={"slot": slot_iso},
        )
        # Try again
        response = client.post(
            f"/api/interviews/{interview_id}/select-slot",
            json={"slot": slot_iso},
        )
        assert response.status_code == 400

    def test_select_invalid_slot(self, client, auth_headers, sample_application):
        slot_time = (datetime.now() + timedelta(days=1)).replace(microsecond=0)
        create_resp = client.post(
            "/api/interviews",
            json={
                "application_id": sample_application.id,
                "available_slots": [slot_time.isoformat()],
            },
            headers=auth_headers,
        )
        interview_id = create_resp.json()["id"]

        wrong_time = (datetime.now() + timedelta(days=5)).replace(microsecond=0)
        response = client.post(
            f"/api/interviews/{interview_id}/select-slot",
            json={"slot": wrong_time.isoformat()},
        )
        assert response.status_code == 400

    def test_select_slot_not_found(self, client):
        response = client.post(
            "/api/interviews/9999/select-slot",
            json={"slot": datetime.now().isoformat()},
        )
        assert response.status_code == 404


class TestUpdateNotes:
    def test_update_notes_success(self, client, auth_headers, sample_application):
        slot_time = (datetime.now() + timedelta(days=1)).isoformat()
        create_resp = client.post(
            "/api/interviews",
            json={
                "application_id": sample_application.id,
                "available_slots": [slot_time],
            },
            headers=auth_headers,
        )
        interview_id = create_resp.json()["id"]

        response = client.put(
            f"/api/interviews/{interview_id}/notes",
            json={"notes": "Great candidate", "status": "completed"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        assert response.json()["message"] == "Interview updated"

    def test_update_notes_not_found(self, client, auth_headers):
        response = client.put(
            "/api/interviews/9999/notes",
            json={"notes": "test"},
            headers=auth_headers,
        )
        assert response.status_code == 404

    def test_update_notes_unauthenticated(self, client):
        response = client.put(
            "/api/interviews/1/notes",
            json={"notes": "test"},
        )
        assert response.status_code == 401
