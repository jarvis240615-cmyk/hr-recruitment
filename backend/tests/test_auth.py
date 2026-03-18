import pytest


class TestLogin:
    def test_login_success(self, client, admin_user):
        response = client.post(
            "/api/auth/login",
            data={"username": "admin@test.com", "password": "adminpass123"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == "admin@test.com"
        assert data["user"]["role"] == "admin"

    def test_login_invalid_password(self, client, admin_user):
        response = client.post(
            "/api/auth/login",
            data={"username": "admin@test.com", "password": "wrongpassword"},
        )
        assert response.status_code == 401

    def test_login_nonexistent_user(self, client):
        response = client.post(
            "/api/auth/login",
            data={"username": "nobody@test.com", "password": "password"},
        )
        assert response.status_code == 401

    def test_login_returns_jwt_token(self, client, admin_user):
        response = client.post(
            "/api/auth/login",
            data={"username": "admin@test.com", "password": "adminpass123"},
        )
        token = response.json()["access_token"]
        # JWT has 3 parts separated by dots
        assert len(token.split(".")) == 3


class TestGetMe:
    def test_get_me_authenticated(self, client, auth_headers):
        response = client.get("/api/auth/me", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "admin@test.com"
        assert data["full_name"] == "Test Admin"

    def test_get_me_unauthenticated(self, client):
        response = client.get("/api/auth/me")
        assert response.status_code == 401


class TestRegister:
    def test_register_by_admin(self, client, auth_headers):
        response = client.post(
            "/api/auth/register",
            json={
                "email": "newuser@test.com",
                "password": "newpass123",
                "full_name": "New User",
                "role": "recruiter",
            },
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "newuser@test.com"
        assert data["role"] == "recruiter"

    def test_register_by_non_admin_forbidden(self, client, recruiter_headers):
        response = client.post(
            "/api/auth/register",
            json={
                "email": "another@test.com",
                "password": "pass123",
                "full_name": "Another User",
                "role": "recruiter",
            },
            headers=recruiter_headers,
        )
        assert response.status_code == 403

    def test_register_duplicate_email(self, client, auth_headers, admin_user):
        response = client.post(
            "/api/auth/register",
            json={
                "email": "admin@test.com",
                "password": "pass123",
                "full_name": "Duplicate",
                "role": "recruiter",
            },
            headers=auth_headers,
        )
        assert response.status_code == 400
