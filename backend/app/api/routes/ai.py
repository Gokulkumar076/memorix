from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.schemas import AIGenerateRequest, CardCreate
from app.services import ai_service, card_service, deck_service
from app.core.security import get_current_user
from app.models.models import CardType

router = APIRouter()


@router.post("/generate-cards")
async def generate_cards(
    data: AIGenerateRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        raw_cards = await ai_service.generate_flashcards(data)
    except RuntimeError as e:
        raise HTTPException(503, str(e))
    except ValueError as e:
        raise HTTPException(502, str(e))

    cards_out = [
        {
            "front": c.get("front", ""),
            "back": c.get("back", ""),
            "tags": c.get("tags", []),
            "card_type": CardType.BASIC,
        }
        for c in raw_cards
        if c.get("front") and c.get("back")
    ]

    # If a deck_id was provided, persist immediately
    if data.deck_id:
        deck = await deck_service.get_deck_by_id(db, data.deck_id)
        if not deck or deck.owner_id != current_user.id:
            raise HTTPException(403, "Access denied")
        card_creates = [
            CardCreate(deck_id=data.deck_id, **c) for c in cards_out
        ]
        saved = await card_service.bulk_create_cards(db, data.deck_id, card_creates)
        return {"cards": saved, "saved": True}

    return {"cards": cards_out, "saved": False}
