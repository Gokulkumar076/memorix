from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List, Optional

from app.models.models import Card, Deck
from app.schemas.schemas import CardCreate, CardUpdate


async def get_card_by_id(db: AsyncSession, card_id: int) -> Optional[Card]:
    result = await db.execute(select(Card).where(Card.id == card_id))
    return result.scalar_one_or_none()


async def get_deck_cards(db: AsyncSession, deck_id: int) -> List[Card]:
    result = await db.execute(
        select(Card).where(Card.deck_id == deck_id).order_by(Card.created_at.desc())
    )
    return result.scalars().all()


async def create_card(db: AsyncSession, data: CardCreate) -> Card:
    payload = data.model_dump()
    if payload.get("choices"):
        payload["choices"] = [c if isinstance(c, dict) else c.model_dump() for c in data.choices]
    card = Card(**payload)
    db.add(card)
    await db.flush()

    deck = await db.get(Deck, data.deck_id)
    if deck:
        deck.card_count += 1

    await db.refresh(card)
    return card


async def bulk_create_cards(db: AsyncSession, deck_id: int, cards_data: List[CardCreate]) -> List[Card]:
    cards = []
    for data in cards_data:
        payload = data.model_dump()
        payload["deck_id"] = deck_id
        if payload.get("choices"):
            payload["choices"] = [c if isinstance(c, dict) else c for c in payload["choices"]]
        card = Card(**payload)
        db.add(card)
        cards.append(card)

    deck = await db.get(Deck, deck_id)
    if deck:
        deck.card_count += len(cards_data)

    await db.flush()
    for c in cards:
        await db.refresh(c)
    return cards


async def update_card(db: AsyncSession, card: Card, data: CardUpdate) -> Card:
    update_data = data.model_dump(exclude_none=True)
    if "choices" in update_data and update_data["choices"]:
        update_data["choices"] = [
            c if isinstance(c, dict) else c.model_dump() for c in data.choices
        ]
    for field, value in update_data.items():
        setattr(card, field, value)
    await db.flush()
    await db.refresh(card)
    return card


async def delete_card(db: AsyncSession, card: Card) -> None:
    deck = await db.get(Deck, card.deck_id)
    if deck and deck.card_count > 0:
        deck.card_count -= 1
    await db.delete(card)
    await db.flush()
