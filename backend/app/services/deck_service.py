from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from datetime import datetime, timezone
from typing import List, Optional

from app.models.models import Deck, Card, DeckCollaborator
from app.schemas.schemas import DeckCreate, DeckUpdate


async def get_deck_by_id(db: AsyncSession, deck_id: int) -> Optional[Deck]:
    result = await db.execute(select(Deck).where(Deck.id == deck_id))
    return result.scalar_one_or_none()


async def get_user_decks(db: AsyncSession, user_id: int) -> List[Deck]:
    result = await db.execute(
        select(Deck).where(Deck.owner_id == user_id).order_by(Deck.updated_at.desc())
    )
    return result.scalars().all()


async def create_deck(db: AsyncSession, owner_id: int, data: DeckCreate) -> Deck:
    deck = Deck(owner_id=owner_id, **data.model_dump())
    db.add(deck)
    await db.flush()
    await db.refresh(deck)
    return deck


async def update_deck(db: AsyncSession, deck: Deck, data: DeckUpdate) -> Deck:
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(deck, field, value)
    await db.flush()
    await db.refresh(deck)
    return deck


async def delete_deck(db: AsyncSession, deck: Deck) -> None:
    await db.delete(deck)
    await db.flush()


async def get_deck_counts(db: AsyncSession, deck_id: int) -> dict:
    now = datetime.now(timezone.utc)
    total = await db.execute(
        select(func.count(Card.id)).where(Card.deck_id == deck_id)
    )
    due = await db.execute(
        select(func.count(Card.id)).where(
            and_(Card.deck_id == deck_id, Card.due <= now, Card.state != "new", Card.is_suspended == False)
        )
    )
    new = await db.execute(
        select(func.count(Card.id)).where(
            and_(Card.deck_id == deck_id, Card.state == "new", Card.is_suspended == False)
        )
    )
    return {
        "card_count": total.scalar() or 0,
        "due_count": due.scalar() or 0,
        "new_count": new.scalar() or 0,
    }


async def is_deck_accessible(db: AsyncSession, deck: Deck, user_id: int) -> bool:
    if deck.owner_id == user_id:
        return True
    if deck.is_public:
        return True
    result = await db.execute(
        select(DeckCollaborator).where(
            and_(DeckCollaborator.deck_id == deck.id, DeckCollaborator.user_id == user_id)
        )
    )
    return result.scalar_one_or_none() is not None


async def add_collaborator(db: AsyncSession, deck_id: int, user_id: int, role: str = "viewer") -> DeckCollaborator:
    collab = DeckCollaborator(deck_id=deck_id, user_id=user_id, role=role)
    db.add(collab)
    await db.flush()
    return collab
