"""
Seed script: creates a demo user with sample decks and cards.
Run with: python -m scripts.seed (from backend/ directory, with venv active)
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import AsyncSessionLocal, engine
from app.db.base import Base
from app.models.models import User, Deck, Card, CardType
from app.core.security import get_password_hash


SAMPLE_DECKS = [
    {
        "name": "Spanish Basics",
        "emoji": "🇪🇸",
        "color": "#ea580c",
        "description": "Core vocabulary for everyday conversation",
        "cards": [
            ("Hola", "Hello"),
            ("Gracias", "Thank you"),
            ("Por favor", "Please"),
            ("Buenos días", "Good morning"),
            ("¿Cómo estás?", "How are you?"),
            ("Adiós", "Goodbye"),
        ],
    },
    {
        "name": "Python Fundamentals",
        "emoji": "💻",
        "color": "#0891b2",
        "description": "Key concepts every Python developer should know",
        "cards": [
            ("What does GIL stand for?", "Global Interpreter Lock"),
            ("What is a list comprehension?", "A concise way to create lists using a single line of code"),
            ("What does `__init__` do?", "It's the constructor method called when a new instance is created"),
            ("What is the difference between a list and a tuple?", "Lists are mutable, tuples are immutable"),
        ],
    },
    {
        "name": "World Capitals",
        "emoji": "🌍",
        "color": "#16a34a",
        "description": "Test your geography knowledge",
        "cards": [
            ("Capital of Japan", "Tokyo"),
            ("Capital of Australia", "Canberra"),
            ("Capital of Canada", "Ottawa"),
            ("Capital of Brazil", "Brasília"),
        ],
    },
]


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        user = User(
            email="demo@memorix.app",
            username="demo",
            hashed_password=get_password_hash("demo12345"),
            display_name="Demo User",
            daily_goal=20,
        )
        db.add(user)
        await db.flush()

        for deck_data in SAMPLE_DECKS:
            deck = Deck(
                owner_id=user.id,
                name=deck_data["name"],
                description=deck_data["description"],
                cover_emoji=deck_data["emoji"],
                cover_color=deck_data["color"],
                card_count=len(deck_data["cards"]),
            )
            db.add(deck)
            await db.flush()

            for front, back in deck_data["cards"]:
                card = Card(
                    deck_id=deck.id,
                    card_type=CardType.BASIC,
                    front=front,
                    back=back,
                    tags=["demo"],
                )
                db.add(card)

        await db.commit()
        print(f"Seeded user: demo@memorix.app / demo12345")
        print(f"Created {len(SAMPLE_DECKS)} decks with sample cards")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())
