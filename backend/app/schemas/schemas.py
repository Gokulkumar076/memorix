from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any
from datetime import datetime
from app.models.models import CardType, ReviewRating


# --- Auth ---

class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8)
    display_name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefresh(BaseModel):
    refresh_token: str


# --- User ---

class UserOut(BaseModel):
    id: int
    email: str
    username: str
    display_name: Optional[str]
    avatar_url: Optional[str]
    daily_goal: int
    streak: int
    longest_streak: int
    total_xp: int
    level: int
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    daily_goal: Optional[int] = None
    timezone: Optional[str] = None


# --- Deck ---

class DeckCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    cover_color: str = "#6366f1"
    cover_emoji: str = "📚"
    is_public: bool = False
    tags: List[str] = []


class DeckUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    cover_color: Optional[str] = None
    cover_emoji: Optional[str] = None
    is_public: Optional[bool] = None
    tags: Optional[List[str]] = None


class DeckOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    cover_color: str
    cover_emoji: str
    is_public: bool
    is_collaborative: bool
    owner_id: int
    tags: List[str]
    card_count: int
    due_count: Optional[int] = 0
    new_count: Optional[int] = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# --- Card ---

class ChoiceItem(BaseModel):
    text: str
    is_correct: bool


class CardCreate(BaseModel):
    deck_id: int
    card_type: CardType = CardType.BASIC
    front: str
    back: Optional[str] = None
    cloze_text: Optional[str] = None
    image_url: Optional[str] = None
    choices: Optional[List[ChoiceItem]] = None
    tags: List[str] = []
    notes: Optional[str] = None


class CardUpdate(BaseModel):
    front: Optional[str] = None
    back: Optional[str] = None
    cloze_text: Optional[str] = None
    image_url: Optional[str] = None
    choices: Optional[List[ChoiceItem]] = None
    tags: Optional[List[str]] = None
    notes: Optional[str] = None
    is_suspended: Optional[bool] = None


class CardOut(BaseModel):
    id: int
    deck_id: int
    card_type: CardType
    front: str
    back: Optional[str]
    cloze_text: Optional[str]
    image_url: Optional[str]
    choices: Optional[List[Any]]
    tags: List[str]
    notes: Optional[str]
    stability: float
    difficulty: float
    due: datetime
    last_review: Optional[datetime]
    reps: int
    lapses: int
    state: str
    is_suspended: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# --- Review ---

class ReviewSubmit(BaseModel):
    card_id: int
    rating: ReviewRating
    duration_ms: Optional[int] = None


class ReviewResponse(BaseModel):
    card_id: int
    next_due: datetime
    scheduled_days: int
    stability: float
    difficulty: float
    state: str
    xp_earned: int
    rating: str


class StudySessionStart(BaseModel):
    deck_id: int
    limit: int = 20


class StudyCard(BaseModel):
    card: CardOut
    rating_preview: dict


# --- Analytics ---

class DailyStats(BaseModel):
    date: str
    reviews: int
    new_cards: int
    retention: float
    study_time_minutes: float


class AnalyticsSummary(BaseModel):
    total_reviews: int
    total_cards: int
    cards_due_today: int
    cards_new: int
    average_retention: float
    current_streak: int
    total_xp: int
    level: int
    daily_stats: List[DailyStats]
    heatmap_data: dict


# --- AI ---

class AIGenerateRequest(BaseModel):
    topic: str
    num_cards: int = 10
    card_type: CardType = CardType.BASIC
    difficulty: str = "intermediate"
    deck_id: Optional[int] = None


class AIGenerateResponse(BaseModel):
    cards: List[CardCreate]
    deck_name: str
