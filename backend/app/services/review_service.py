from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import datetime, timezone, timedelta
from typing import List, Optional

from app.models.models import Card, ReviewLog, ReviewRating, User, Deck
from app.schemas.schemas import ReviewSubmit
from app.services.fsrs import FSRS, FSRSCard

fsrs = FSRS()


def card_to_fsrs(card: Card) -> FSRSCard:
    return FSRSCard(
        stability=card.stability,
        difficulty=card.difficulty,
        due=card.due if card.due.tzinfo else card.due.replace(tzinfo=timezone.utc),
        last_review=card.last_review,
        reps=card.reps,
        lapses=card.lapses,
        state=card.state,
        scheduled_days=card.scheduled_days,
        elapsed_days=card.elapsed_days,
    )


async def get_due_cards(
    db: AsyncSession,
    deck_id: int,
    user_id: int,
    limit: int = 20,
) -> List[Card]:
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(Card)
        .where(
            and_(
                Card.deck_id == deck_id,
                Card.is_suspended == False,
                Card.due <= now,
            )
        )
        .order_by(Card.due)
        .limit(limit)
    )
    return result.scalars().all()


async def get_new_cards(
    db: AsyncSession,
    deck_id: int,
    limit: int = 10,
) -> List[Card]:
    result = await db.execute(
        select(Card)
        .where(
            and_(
                Card.deck_id == deck_id,
                Card.state == "new",
                Card.is_suspended == False,
            )
        )
        .order_by(Card.created_at)
        .limit(limit)
    )
    return result.scalars().all()


async def get_study_queue(
    db: AsyncSession,
    deck_id: int,
    user_id: int,
    limit: int = 20,
) -> List[Card]:
    due = await get_due_cards(db, deck_id, user_id, limit)
    remaining = limit - len(due)
    if remaining > 0:
        new_cards = await get_new_cards(db, deck_id, remaining)
        # Merge: interleave new cards every 5 due cards
        merged = []
        new_iter = iter(new_cards)
        new_count = 0
        for card in due:
            merged.append(card)
            new_count += 1
            if new_count % 5 == 0:
                try:
                    merged.append(next(new_iter))
                except StopIteration:
                    pass
        merged.extend(new_iter)
        return merged
    return due


async def process_review(
    db: AsyncSession,
    card: Card,
    user: User,
    rating: str,
    duration_ms: Optional[int] = None,
) -> dict:
    now = datetime.now(timezone.utc)
    fsrs_card = card_to_fsrs(card)
    state_before = card.state

    info = fsrs.schedule(fsrs_card, rating, now)
    new_card = info.card

    # Compute elapsed days
    if card.last_review:
        last = card.last_review if card.last_review.tzinfo else card.last_review.replace(tzinfo=timezone.utc)
        elapsed = max(0, (now - last).days)
    else:
        elapsed = 0

    # Update card
    card.stability = new_card.stability
    card.difficulty = new_card.difficulty
    card.due = new_card.due
    card.last_review = now
    card.reps = new_card.reps
    card.lapses = new_card.lapses
    card.state = new_card.state
    card.scheduled_days = new_card.scheduled_days
    card.elapsed_days = elapsed

    # XP calculation
    xp_map = {"again": 1, "hard": 3, "good": 5, "easy": 7}
    xp_earned = xp_map.get(rating, 5)

    # Log review
    log = ReviewLog(
        card_id=card.id,
        user_id=user.id,
        rating=ReviewRating(rating),
        state_before=state_before,
        state_after=new_card.state,
        stability_before=fsrs_card.stability,
        difficulty_before=fsrs_card.difficulty,
        scheduled_days=new_card.scheduled_days,
        elapsed_days=elapsed,
        review_duration_ms=duration_ms,
        reviewed_at=now,
    )
    db.add(log)

    # Update streak
    today = now.date()
    if user.last_study_date:
        last_date = user.last_study_date.date() if hasattr(user.last_study_date, 'date') else user.last_study_date
        if last_date == today - timedelta(days=1):
            user.streak += 1
        elif last_date < today - timedelta(days=1):
            user.streak = 1
    else:
        user.streak = 1

    user.last_study_date = now
    if user.streak > user.longest_streak:
        user.longest_streak = user.streak

    await db.flush()

    return {
        "card_id": card.id,
        "next_due": new_card.due,
        "scheduled_days": new_card.scheduled_days,
        "stability": round(new_card.stability, 3),
        "difficulty": round(new_card.difficulty, 3),
        "state": new_card.state,
        "xp_earned": xp_earned,
        "rating": rating,
    }


def get_rating_preview(card: Card) -> dict:
    fsrs_card = card_to_fsrs(card)
    return fsrs.get_all_ratings_preview(fsrs_card)
