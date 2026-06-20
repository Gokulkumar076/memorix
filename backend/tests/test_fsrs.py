import pytest
from datetime import datetime, timezone, timedelta

from app.services.fsrs import FSRS, FSRSCard


def test_new_card_easy_goes_to_review_state():
    fsrs = FSRS()
    card = FSRSCard()
    info = fsrs.schedule(card, "easy")
    assert info.card.state == "review"
    assert info.card.stability > 0


def test_new_card_again_stays_learning():
    fsrs = FSRS()
    card = FSRSCard()
    info = fsrs.schedule(card, "again")
    assert info.card.state == "learning"
    assert info.scheduled_days == 0


def test_review_card_again_triggers_lapse():
    fsrs = FSRS()
    card = FSRSCard(stability=10.0, difficulty=5.0, state="review", reps=3,
                     last_review=datetime.now(timezone.utc) - timedelta(days=5))
    info = fsrs.schedule(card, "again")
    assert info.card.state == "relearning"
    assert info.card.lapses == 1


def test_review_card_good_increases_stability():
    fsrs = FSRS()
    card = FSRSCard(stability=10.0, difficulty=5.0, state="review", reps=3,
                     last_review=datetime.now(timezone.utc) - timedelta(days=10))
    info = fsrs.schedule(card, "good")
    assert info.card.stability > card.stability
    assert info.card.state == "review"


def test_easy_yields_longer_interval_than_good():
    fsrs = FSRS()
    card_good = FSRSCard(stability=10.0, difficulty=5.0, state="review", reps=3,
                          last_review=datetime.now(timezone.utc) - timedelta(days=10))
    card_easy = FSRSCard(stability=10.0, difficulty=5.0, state="review", reps=3,
                          last_review=datetime.now(timezone.utc) - timedelta(days=10))

    good_info = fsrs.schedule(card_good, "good")
    easy_info = fsrs.schedule(card_easy, "easy")

    assert easy_info.scheduled_days >= good_info.scheduled_days


def test_difficulty_bounded_between_1_and_10():
    fsrs = FSRS()
    card = FSRSCard(stability=5.0, difficulty=1.0, state="review", reps=10,
                     last_review=datetime.now(timezone.utc) - timedelta(days=3))
    for _ in range(20):
        info = fsrs.schedule(card, "easy")
        card = info.card
        assert 1 <= card.difficulty <= 10


def test_rating_preview_has_all_four_options():
    fsrs = FSRS()
    card = FSRSCard()
    preview = fsrs.get_all_ratings_preview(card)
    assert set(preview.keys()) == {"again", "hard", "good", "easy"}
    for r in preview.values():
        assert "due" in r and "stability" in r and "difficulty" in r
