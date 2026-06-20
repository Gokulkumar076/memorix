import tempfile
import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
import io

from app.db.session import get_db
from app.services import import_export_service, card_service, deck_service
from app.core.security import get_current_user

router = APIRouter()


@router.get("/export/{deck_id}/csv")
async def export_csv(
    deck_id: int,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    deck = await deck_service.get_deck_by_id(db, deck_id)
    if not deck or not await deck_service.is_deck_accessible(db, deck, current_user.id):
        raise HTTPException(403, "Access denied")

    cards = await card_service.get_deck_cards(db, deck_id)
    csv_content = await import_export_service.export_deck_to_csv(cards)

    return StreamingResponse(
        io.BytesIO(csv_content.encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={deck.name}.csv"},
    )


@router.get("/export/{deck_id}/json")
async def export_json(
    deck_id: int,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    deck = await deck_service.get_deck_by_id(db, deck_id)
    if not deck or not await deck_service.is_deck_accessible(db, deck, current_user.id):
        raise HTTPException(403, "Access denied")

    cards = await card_service.get_deck_cards(db, deck_id)
    return await import_export_service.export_deck_to_apkg_compatible_json(cards)


@router.post("/import/{deck_id}/csv")
async def import_csv(
    deck_id: int,
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    deck = await deck_service.get_deck_by_id(db, deck_id)
    if not deck or deck.owner_id != current_user.id:
        raise HTTPException(403, "Access denied")

    content = await file.read()
    try:
        cards_data = import_export_service.parse_csv_import(content)
    except Exception as e:
        raise HTTPException(400, f"Failed to parse CSV: {str(e)}")

    for c in cards_data:
        c.deck_id = deck_id

    saved = await card_service.bulk_create_cards(db, deck_id, cards_data)
    return {"imported": len(saved)}


@router.post("/import/{deck_id}/anki")
async def import_anki(
    deck_id: int,
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    deck = await deck_service.get_deck_by_id(db, deck_id)
    if not deck or deck.owner_id != current_user.id:
        raise HTTPException(403, "Access denied")

    if not file.filename.endswith(".apkg"):
        raise HTTPException(400, "File must be a .apkg Anki export")

    content = await file.read()
    with tempfile.NamedTemporaryFile(suffix=".apkg", delete=False) as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        cards_data = import_export_service.parse_apkg_import(tmp_path)
    except Exception as e:
        raise HTTPException(400, f"Failed to parse Anki file: {str(e)}")
    finally:
        os.unlink(tmp_path)

    for c in cards_data:
        c.deck_id = deck_id

    saved = await card_service.bulk_create_cards(db, deck_id, cards_data)
    return {"imported": len(saved)}
