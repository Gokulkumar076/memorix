from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.session import get_db
from app.schemas.schemas import DeckCreate, DeckUpdate, DeckOut
from app.services import deck_service
from app.core.security import get_current_user

router = APIRouter()


@router.get("", response_model=List[DeckOut])
async def list_decks(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    decks = await deck_service.get_user_decks(db, current_user.id)
    result = []
    for deck in decks:
        counts = await deck_service.get_deck_counts(db, deck.id)
        deck_dict = DeckOut.model_validate(deck).model_dump()
        deck_dict.update(counts)
        result.append(DeckOut(**deck_dict))
    return result


@router.post("", response_model=DeckOut, status_code=201)
async def create_deck(
    data: DeckCreate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    deck = await deck_service.create_deck(db, current_user.id, data)
    deck_dict = DeckOut.model_validate(deck).model_dump()
    deck_dict.update({"card_count": 0, "due_count": 0, "new_count": 0})
    return DeckOut(**deck_dict)


@router.get("/{deck_id}", response_model=DeckOut)
async def get_deck(
    deck_id: int,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    deck = await deck_service.get_deck_by_id(db, deck_id)
    if not deck:
        raise HTTPException(404, "Deck not found")
    if not await deck_service.is_deck_accessible(db, deck, current_user.id):
        raise HTTPException(403, "Access denied")
    counts = await deck_service.get_deck_counts(db, deck.id)
    deck_dict = DeckOut.model_validate(deck).model_dump()
    deck_dict.update(counts)
    return DeckOut(**deck_dict)


@router.patch("/{deck_id}", response_model=DeckOut)
async def update_deck(
    deck_id: int,
    data: DeckUpdate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    deck = await deck_service.get_deck_by_id(db, deck_id)
    if not deck:
        raise HTTPException(404, "Deck not found")
    if deck.owner_id != current_user.id:
        raise HTTPException(403, "Only the owner can update this deck")
    deck = await deck_service.update_deck(db, deck, data)
    counts = await deck_service.get_deck_counts(db, deck.id)
    deck_dict = DeckOut.model_validate(deck).model_dump()
    deck_dict.update(counts)
    return DeckOut(**deck_dict)


@router.delete("/{deck_id}", status_code=204)
async def delete_deck(
    deck_id: int,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    deck = await deck_service.get_deck_by_id(db, deck_id)
    if not deck:
        raise HTTPException(404, "Deck not found")
    if deck.owner_id != current_user.id:
        raise HTTPException(403, "Only the owner can delete this deck")
    await deck_service.delete_deck(db, deck)


@router.post("/{deck_id}/collaborators/{user_id}")
async def add_collaborator(
    deck_id: int,
    user_id: int,
    role: str = "viewer",
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    deck = await deck_service.get_deck_by_id(db, deck_id)
    if not deck:
        raise HTTPException(404, "Deck not found")
    if deck.owner_id != current_user.id:
        raise HTTPException(403, "Only the owner can add collaborators")
    deck.is_collaborative = True
    await deck_service.add_collaborator(db, deck_id, user_id, role)
    return {"status": "added"}
