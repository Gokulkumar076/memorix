from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.session import get_db
from app.schemas.schemas import CardCreate, CardUpdate, CardOut
from app.services import card_service, deck_service
from app.core.security import get_current_user

router = APIRouter()


async def _check_deck_access(db, deck_id, user_id, require_owner=False):
    deck = await deck_service.get_deck_by_id(db, deck_id)
    if not deck:
        raise HTTPException(404, "Deck not found")
    if require_owner and deck.owner_id != user_id:
        raise HTTPException(403, "Only the owner can modify this deck")
    if not await deck_service.is_deck_accessible(db, deck, user_id):
        raise HTTPException(403, "Access denied")
    return deck


@router.get("/deck/{deck_id}", response_model=List[CardOut])
async def list_cards(
    deck_id: int,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _check_deck_access(db, deck_id, current_user.id)
    return await card_service.get_deck_cards(db, deck_id)


@router.post("", response_model=CardOut, status_code=201)
async def create_card(
    data: CardCreate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _check_deck_access(db, data.deck_id, current_user.id, require_owner=True)
    return await card_service.create_card(db, data)


@router.post("/bulk", response_model=List[CardOut], status_code=201)
async def bulk_create_cards(
    deck_id: int,
    cards: List[CardCreate],
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _check_deck_access(db, deck_id, current_user.id, require_owner=True)
    return await card_service.bulk_create_cards(db, deck_id, cards)


@router.patch("/{card_id}", response_model=CardOut)
async def update_card(
    card_id: int,
    data: CardUpdate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    card = await card_service.get_card_by_id(db, card_id)
    if not card:
        raise HTTPException(404, "Card not found")
    await _check_deck_access(db, card.deck_id, current_user.id, require_owner=True)
    return await card_service.update_card(db, card, data)


@router.delete("/{card_id}", status_code=204)
async def delete_card(
    card_id: int,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    card = await card_service.get_card_by_id(db, card_id)
    if not card:
        raise HTTPException(404, "Card not found")
    await _check_deck_access(db, card.deck_id, current_user.id, require_owner=True)
    await card_service.delete_card(db, card)
