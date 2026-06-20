import csv
import io
import json
import sqlite3
import tempfile
import zipfile
from typing import List

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import Card, CardType
from app.schemas.schemas import CardCreate
from app.services import card_service


async def export_deck_to_csv(cards: List[Card]) -> str:
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["front", "back", "tags", "card_type"])
    for c in cards:
        writer.writerow([c.front, c.back or "", " ".join(c.tags or []), c.card_type.value])
    return output.getvalue()


def parse_csv_import(content: bytes) -> List[CardCreate]:
    text = content.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text))
    cards = []
    for row in reader:
        front = row.get("front") or row.get("Front") or ""
        back = row.get("back") or row.get("Back") or ""
        if not front:
            continue
        tags_raw = row.get("tags") or row.get("Tags") or ""
        tags = tags_raw.split() if tags_raw else []
        cards.append(CardCreate(
            deck_id=0,  # set by caller
            card_type=CardType.BASIC,
            front=front,
            back=back,
            tags=tags,
        ))
    return cards


def parse_apkg_import(file_path: str) -> List[CardCreate]:
    """
    Parse an Anki .apkg file (zip containing collection.anki2 sqlite db).
    Extracts basic note fields (front/back separated by the standard \\x1f delimiter).
    """
    cards = []
    with zipfile.ZipFile(file_path, "r") as z:
        db_name = "collection.anki21" if "collection.anki21" in z.namelist() else "collection.anki2"
        if db_name not in z.namelist():
            raise ValueError("Invalid .apkg file: no collection database found")

        with tempfile.NamedTemporaryFile(suffix=".sqlite", delete=False) as tmp:
            tmp.write(z.read(db_name))
            tmp_path = tmp.name

    try:
        conn = sqlite3.connect(tmp_path)
        cursor = conn.cursor()
        cursor.execute("SELECT flds FROM notes")
        rows = cursor.fetchall()
        for (flds,) in rows:
            parts = flds.split("\x1f")
            if len(parts) >= 2:
                front, back = parts[0], parts[1]
                # Strip basic HTML
                import re
                front_clean = re.sub(r"<[^>]+>", "", front).strip()
                back_clean = re.sub(r"<[^>]+>", "", back).strip()
                if front_clean:
                    cards.append(CardCreate(
                        deck_id=0,
                        card_type=CardType.BASIC,
                        front=front_clean,
                        back=back_clean,
                        tags=["imported"],
                    ))
        conn.close()
    finally:
        import os
        os.unlink(tmp_path)

    return cards


async def export_deck_to_apkg_compatible_json(cards: List[Card]) -> dict:
    """Export in a simple JSON format (apkg binary export requires genanki, not available; offer JSON/CSV)."""
    return {
        "cards": [
            {
                "front": c.front,
                "back": c.back,
                "card_type": c.card_type.value,
                "tags": c.tags,
            }
            for c in cards
        ]
    }
