"""
FSRS v4.5 Algorithm Implementation
Free Spaced Repetition Scheduler
Based on: https://github.com/open-spaced-repetition/fsrs4anki
"""
from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from typing import Optional
import math


# FSRS default parameters (trained on large dataset)
DEFAULT_PARAMETERS = [
    0.4072, 1.1829, 3.1262, 15.4722,   # w0-w3: initial stability for ratings
    7.2102, 0.5316, 1.0651, 0.0589,     # w4-w7
    1.4760, 0.1544, 1.0040, 1.9813,     # w8-w11
    0.0953, 0.2975, 2.2042, 0.2407,     # w12-w15
    2.9466, 0.5034, 0.6567              # w16-w18
]

DECAY = -0.5
FACTOR = 0.9 ** (1 / DECAY) - 1


@dataclass
class FSRSCard:
    stability: float = 0.0
    difficulty: float = 0.3
    due: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    last_review: Optional[datetime] = None
    reps: int = 0
    lapses: int = 0
    state: str = "new"  # new | learning | review | relearning
    scheduled_days: int = 0
    elapsed_days: int = 0


@dataclass
class SchedulingInfo:
    card: FSRSCard
    scheduled_days: int
    due: datetime


class FSRS:
    def __init__(self, parameters: list[float] = None):
        self.w = parameters or DEFAULT_PARAMETERS
        self.request_retention = 0.9

    # --- Core formulas ---

    def forgetting_curve(self, elapsed_days: float, stability: float) -> float:
        """Returns retrievability at elapsed_days given stability."""
        return (1 + FACTOR * elapsed_days / stability) ** DECAY

    def initial_stability(self, rating: int) -> float:
        """Initial stability after first review (rating: 1=Again, 2=Hard, 3=Good, 4=Easy)."""
        return self.w[rating - 1]

    def initial_difficulty(self, rating: int) -> float:
        """Initial difficulty after first review."""
        return self.w[4] - math.exp(self.w[5] * (rating - 1)) + 1

    def next_difficulty(self, d: float, rating: int) -> float:
        next_d = d - self.w[6] * (rating - 3)
        return self._mean_reversion(self.w[4], next_d)

    def _mean_reversion(self, init: float, current: float) -> float:
        return self.w[7] * init + (1 - self.w[7]) * current

    def next_stability_after_recall(self, d: float, s: float, r: float, rating: int) -> float:
        hard_penalty = self.w[15] if rating == 2 else 1
        easy_bonus = self.w[16] if rating == 4 else 1
        return s * (
            math.exp(self.w[8])
            * (11 - d)
            * s ** (-self.w[9])
            * (math.exp((1 - r) * self.w[10]) - 1)
            * hard_penalty
            * easy_bonus
        )

    def next_stability_after_forget(self, d: float, s: float, r: float) -> float:
        return (
            self.w[11]
            * d ** (-self.w[12])
            * ((s + 1) ** self.w[13] - 1)
            * math.exp((1 - r) * self.w[14])
        )

    def next_interval(self, stability: float) -> int:
        """Compute next interval in days."""
        new_interval = stability / FACTOR * (self.request_retention ** (1 / DECAY) - 1)
        return max(1, round(new_interval))

    # --- Scheduling ---

    def schedule(self, card: FSRSCard, rating_str: str, now: datetime = None) -> SchedulingInfo:
        """
        Apply a review rating to a card and return the new scheduling info.
        rating_str: "again" | "hard" | "good" | "easy"
        """
        if now is None:
            now = datetime.now(timezone.utc)

        rating_map = {"again": 1, "hard": 2, "good": 3, "easy": 4}
        rating = rating_map[rating_str]

        # Elapsed days since last review (or 0 for new cards)
        if card.last_review:
            last = card.last_review if card.last_review.tzinfo else card.last_review.replace(tzinfo=timezone.utc)
            elapsed = max(0, (now - last).days)
        else:
            elapsed = 0

        # Current retrievability
        if card.stability > 0:
            r = self.forgetting_curve(elapsed, card.stability)
        else:
            r = 0.0

        new_card = FSRSCard(
            stability=card.stability,
            difficulty=card.difficulty,
            due=card.due,
            last_review=now,
            reps=card.reps,
            lapses=card.lapses,
            state=card.state,
            scheduled_days=card.scheduled_days,
            elapsed_days=elapsed,
        )

        if card.state == "new":
            new_card.stability = self.initial_stability(rating)
            new_card.difficulty = max(1, min(10, self.initial_difficulty(rating)))
            new_card.reps = 1

            if rating == 1:  # Again
                new_card.state = "learning"
                scheduled_days = 0
                interval_minutes = 1
            elif rating == 2:  # Hard
                new_card.state = "learning"
                scheduled_days = 0
                interval_minutes = 5
            elif rating == 3:  # Good
                new_card.state = "learning"
                scheduled_days = 0
                interval_minutes = 10
            else:  # Easy
                new_card.state = "review"
                scheduled_days = max(1, self.next_interval(new_card.stability))
                interval_minutes = None

        elif card.state in ("learning", "relearning"):
            new_card.stability = self.initial_stability(rating)
            new_card.difficulty = max(1, min(10, self.initial_difficulty(rating)))
            new_card.reps += 1

            if rating == 1:
                new_card.state = card.state
                scheduled_days = 0
                interval_minutes = 5
            elif rating == 2:
                new_card.state = card.state
                scheduled_days = 0
                interval_minutes = 10
            elif rating == 3:
                new_card.state = "review"
                scheduled_days = max(1, self.next_interval(new_card.stability))
                interval_minutes = None
            else:
                new_card.state = "review"
                scheduled_days = max(1, self.next_interval(new_card.stability) * 2)
                interval_minutes = None

        else:  # review state
            new_card.reps += 1

            if rating == 1:  # Again (lapse)
                new_card.lapses += 1
                new_card.state = "relearning"
                new_card.stability = self.next_stability_after_forget(card.difficulty, card.stability, r)
                new_card.difficulty = max(1, min(10, self.next_difficulty(card.difficulty, rating)))
                scheduled_days = 0
                interval_minutes = 10
            else:
                new_card.state = "review"
                new_card.stability = max(
                    self.next_stability_after_recall(card.difficulty, card.stability, r, rating),
                    card.stability + 0.01
                )
                new_card.difficulty = max(1, min(10, self.next_difficulty(card.difficulty, rating)))
                scheduled_days = self.next_interval(new_card.stability)
                interval_minutes = None

        new_card.scheduled_days = scheduled_days

        if interval_minutes is not None:
            new_card.due = now + timedelta(minutes=interval_minutes)
        else:
            new_card.due = now + timedelta(days=scheduled_days)

        return SchedulingInfo(card=new_card, scheduled_days=scheduled_days, due=new_card.due)

    def get_all_ratings_preview(self, card: FSRSCard, now: datetime = None):
        """Return preview of what each rating would schedule."""
        if now is None:
            now = datetime.now(timezone.utc)
        results = {}
        for r in ["again", "hard", "good", "easy"]:
            info = self.schedule(card, r, now)
            results[r] = {
                "due": info.due,
                "scheduled_days": info.scheduled_days,
                "stability": round(info.card.stability, 2),
                "difficulty": round(info.card.difficulty, 2),
            }
        return results
