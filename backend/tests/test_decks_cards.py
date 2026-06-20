import pytest

pytestmark = pytest.mark.asyncio


async def test_create_and_list_decks(client, auth_headers):
    r = await client.post("/api/decks", json={"name": "Biology", "description": "Bio 101"}, headers=auth_headers)
    assert r.status_code == 201
    deck = r.json()
    assert deck["name"] == "Biology"
    assert deck["card_count"] == 0

    r = await client.get("/api/decks", headers=auth_headers)
    assert r.status_code == 200
    assert any(d["name"] == "Biology" for d in r.json())


async def test_deck_not_found(client, auth_headers):
    r = await client.get("/api/decks/99999", headers=auth_headers)
    assert r.status_code == 404


async def test_create_card_in_deck(client, auth_headers):
    r = await client.post("/api/decks", json={"name": "Chem"}, headers=auth_headers)
    deck_id = r.json()["id"]

    r = await client.post("/api/cards", json={
        "deck_id": deck_id, "card_type": "basic", "front": "H2O", "back": "Water"
    }, headers=auth_headers)
    assert r.status_code == 201
    card = r.json()
    assert card["state"] == "new"
    assert card["stability"] == 0.0

    r = await client.get(f"/api/cards/deck/{deck_id}", headers=auth_headers)
    assert r.status_code == 200
    assert len(r.json()) == 1


async def test_cloze_card_creation(client, auth_headers):
    r = await client.post("/api/decks", json={"name": "Cloze Deck"}, headers=auth_headers)
    deck_id = r.json()["id"]

    r = await client.post("/api/cards", json={
        "deck_id": deck_id,
        "card_type": "cloze",
        "front": "The capital of France is {{c1::Paris}}",
        "cloze_text": "The capital of France is {{c1::Paris}}",
    }, headers=auth_headers)
    assert r.status_code == 201
    assert r.json()["card_type"] == "cloze"


async def test_multiple_choice_card(client, auth_headers):
    r = await client.post("/api/decks", json={"name": "MCQ Deck"}, headers=auth_headers)
    deck_id = r.json()["id"]

    r = await client.post("/api/cards", json={
        "deck_id": deck_id,
        "card_type": "multiple_choice",
        "front": "What is 2+2?",
        "choices": [
            {"text": "3", "is_correct": False},
            {"text": "4", "is_correct": True},
            {"text": "5", "is_correct": False},
        ],
    }, headers=auth_headers)
    assert r.status_code == 201
    assert len(r.json()["choices"]) == 3


async def test_delete_card_updates_deck_count(client, auth_headers):
    r = await client.post("/api/decks", json={"name": "Delete Test"}, headers=auth_headers)
    deck_id = r.json()["id"]

    r = await client.post("/api/cards", json={
        "deck_id": deck_id, "card_type": "basic", "front": "Q", "back": "A"
    }, headers=auth_headers)
    card_id = r.json()["id"]

    r = await client.delete(f"/api/cards/{card_id}", headers=auth_headers)
    assert r.status_code == 204

    r = await client.get(f"/api/decks/{deck_id}", headers=auth_headers)
    assert r.json()["card_count"] == 0
