from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.session import get_db
from app.schemas.schemas import ReviewSubmit, ReviewResponse, CardOut, StudySessionStart
from app.services import review_service, card_service, deck_service, user_service
from app.core.security import get_current_user

router = APIRouter()


@router.post("/study-queue", response_model=List[CardOut])
async def get_study_queue(
    data: StudySessionStart,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    deck = await deck_service.get_deck_by_id(db, data.deck_id)
    if not deck:
        raise HTTPException(404, "Deck not found")
    if not await deck_service.is_deck_accessible(db, deck, current_user.id):
        raise HTTPException(403, "Access denied")

    cards = await review_service.get_study_queue(db, data.deck_id, current_user.id, data.limit)
    return cards


@router.get("/preview/{card_id}")
async def preview_ratings(
    card_id: int,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    card = await card_service.get_card_by_id(db, card_id)
    if not card:
        raise HTTPException(404, "Card not found")
    return review_service.get_rating_preview(card)


@router.post("/submit", response_model=ReviewResponse)
async def submit_review(
    data: ReviewSubmit,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    card = await card_service.get_card_by_id(db, data.card_id)
    if not card:
        raise HTTPException(404, "Card not found")

    deck = await deck_service.get_deck_by_id(db, card.deck_id)
    if not await deck_service.is_deck_accessible(db, deck, current_user.id):
        raise HTTPException(403, "Access denied")

    result = await review_service.process_review(
        db, card, current_user, data.rating.value, data.duration_ms
    )
    await user_service.add_xp(db, current_user, result["xp_earned"])

    return ReviewResponse(**result)


@router.post("/sync-offline")
async def sync_offline_reviews(
    reviews: List[ReviewSubmit],
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Batch sync reviews accumulated while offline (IndexedDB)."""
    results = []
    for data in reviews:
        card = await card_service.get_card_by_id(db, data.card_id)
        if not card:
            continue
        deck = await deck_service.get_deck_by_id(db, card.deck_id)
        if not await deck_service.is_deck_accessible(db, deck, current_user.id):
            continue
        result = await review_service.process_review(
            db, card, current_user, data.rating.value, data.duration_ms
        )
        await user_service.add_xp(db, current_user, result["xp_earned"])
        results.append(result)
    return {"synced": len(results), "results": results}
