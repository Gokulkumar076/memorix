import os
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test_memorix.db"

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

from app.main import app


@pytest_asyncio.fixture
async def client():
    async with app.router.lifespan_context(app):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as c:
            yield c


@pytest_asyncio.fixture
async def auth_headers(client: AsyncClient):
    await client.post("/api/auth/register", json={
        "email": "pytest@example.com",
        "username": "pytester",
        "password": "password123",
    })
    r = await client.post("/api/auth/login", json={
        "email": "pytest@example.com",
        "password": "password123",
    })
    token = r.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
