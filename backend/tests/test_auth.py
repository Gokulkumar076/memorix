import pytest

pytestmark = pytest.mark.asyncio


async def test_register_and_login(client):
    r = await client.post("/api/auth/register", json={
        "email": "alice@example.com", "username": "alice", "password": "password123"
    })
    assert r.status_code == 201
    assert r.json()["email"] == "alice@example.com"

    r = await client.post("/api/auth/login", json={
        "email": "alice@example.com", "password": "password123"
    })
    assert r.status_code == 200
    assert "access_token" in r.json()


async def test_login_wrong_password(client):
    await client.post("/api/auth/register", json={
        "email": "bob@example.com", "username": "bob", "password": "password123"
    })
    r = await client.post("/api/auth/login", json={
        "email": "bob@example.com", "password": "wrongpass"
    })
    assert r.status_code == 401


async def test_duplicate_email_rejected(client):
    payload = {"email": "dup@example.com", "username": "dup1", "password": "password123"}
    r1 = await client.post("/api/auth/register", json=payload)
    assert r1.status_code == 201
    payload["username"] = "dup2"
    r2 = await client.post("/api/auth/register", json=payload)
    assert r2.status_code == 400


async def test_me_requires_auth(client):
    r = await client.get("/api/auth/me")
    assert r.status_code == 401


async def test_me_with_token(client, auth_headers):
    r = await client.get("/api/auth/me", headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["username"] == "pytester"
