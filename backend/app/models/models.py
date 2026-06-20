from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text, DateTime,
    ForeignKey, Enum, JSON, func, UniqueConstraint, Index
)
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum

from app.db.base import Base


class CardType(str, enum.Enum):
    BASIC = "basic"
    CLOZE = "cloze"
    IMAGE = "image"
    MULTIPLE_CHOICE = "multiple_choice"


class ReviewRating(str, enum.Enum):
    AGAIN = "again"
    HARD = "hard"
    GOOD = "good"
    EASY = "easy"


def utcnow():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    display_name = Column(String(150))
    avatar_url = Column(String(500))
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    timezone = Column(String(50), default="UTC")
    daily_goal = Column(Integer, default=20)
    streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    total_xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    last_study_date = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    decks = relationship("Deck", back_populates="owner", cascade="all, delete-orphan")
    review_logs = relationship("ReviewLog", back_populates="user", cascade="all, delete-orphan")
    badges = relationship("UserBadge", back_populates="user", cascade="all, delete-orphan")


class Deck(Base):
    __tablename__ = "decks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    cover_color = Column(String(7), default="#6366f1")
    cover_emoji = Column(String(10), default="📚")
    is_public = Column(Boolean, default=False)
    is_collaborative = Column(Boolean, default=False)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    parent_deck_id = Column(Integer, ForeignKey("decks.id", ondelete="SET NULL"))
    tags = Column(JSON, default=list)
    card_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    owner = relationship("User", back_populates="decks")
    cards = relationship("Card", back_populates="deck", cascade="all, delete-orphan")
    collaborators = relationship("DeckCollaborator", back_populates="deck", cascade="all, delete-orphan")

    __table_args__ = (Index("ix_deck_owner_name", "owner_id", "name"),)


class DeckCollaborator(Base):
    __tablename__ = "deck_collaborators"

    id = Column(Integer, primary_key=True, index=True)
    deck_id = Column(Integer, ForeignKey("decks.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), default="viewer")  # viewer, editor
    created_at = Column(DateTime(timezone=True), default=utcnow)

    deck = relationship("Deck", back_populates="collaborators")

    __table_args__ = (UniqueConstraint("deck_id", "user_id", name="uq_deck_collaborator"),)


class Card(Base):
    __tablename__ = "cards"

    id = Column(Integer, primary_key=True, index=True)
    deck_id = Column(Integer, ForeignKey("decks.id", ondelete="CASCADE"), nullable=False)
    card_type = Column(Enum(CardType), default=CardType.BASIC, nullable=False)

    # Content
    front = Column(Text, nullable=False)
    back = Column(Text)
    cloze_text = Column(Text)  # for cloze cards
    image_url = Column(String(500))  # for image cards
    choices = Column(JSON)  # for multiple choice [{text, is_correct}]
    tags = Column(JSON, default=list)
    notes = Column(Text)

    # FSRS fields
    stability = Column(Float, default=0.0)
    difficulty = Column(Float, default=0.3)
    due = Column(DateTime(timezone=True), default=utcnow)
    last_review = Column(DateTime(timezone=True))
    reps = Column(Integer, default=0)
    lapses = Column(Integer, default=0)
    state = Column(String(20), default="new")  # new, learning, review, relearning
    scheduled_days = Column(Integer, default=0)
    elapsed_days = Column(Integer, default=0)

    is_suspended = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    deck = relationship("Deck", back_populates="cards")
    review_logs = relationship("ReviewLog", back_populates="card", cascade="all, delete-orphan")

    __table_args__ = (Index("ix_card_deck_due", "deck_id", "due"),)


class ReviewLog(Base):
    __tablename__ = "review_logs"

    id = Column(Integer, primary_key=True, index=True)
    card_id = Column(Integer, ForeignKey("cards.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Enum(ReviewRating), nullable=False)
    state_before = Column(String(20))
    state_after = Column(String(20))
    stability_before = Column(Float)
    difficulty_before = Column(Float)
    scheduled_days = Column(Integer)
    elapsed_days = Column(Integer)
    review_duration_ms = Column(Integer)  # time taken in milliseconds
    reviewed_at = Column(DateTime(timezone=True), default=utcnow)

    card = relationship("Card", back_populates="review_logs")
    user = relationship("User", back_populates="review_logs")

    __table_args__ = (Index("ix_review_user_date", "user_id", "reviewed_at"),)


class Badge(Base):
    __tablename__ = "badges"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    icon = Column(String(10))
    xp_reward = Column(Integer, default=0)
    condition_type = Column(String(50))  # streak, cards_reviewed, decks_created, etc.
    condition_value = Column(Integer)

    user_badges = relationship("UserBadge", back_populates="badge")


class UserBadge(Base):
    __tablename__ = "user_badges"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    badge_id = Column(Integer, ForeignKey("badges.id", ondelete="CASCADE"), nullable=False)
    earned_at = Column(DateTime(timezone=True), default=utcnow)

    user = relationship("User", back_populates="badges")
    badge = relationship("Badge", back_populates="user_badges")

    __table_args__ = (UniqueConstraint("user_id", "badge_id", name="uq_user_badge"),)
