from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import datetime, timezone, timedelta
from collections import defaultdict

from app.models.models import ReviewLog, Card, Deck, ReviewRating, User


async def get_analytics_summary(db: AsyncSession, user_id: int) -> dict:
    now = datetime.now(timezone.utc)
    thirty_days_ago = now - timedelta(days=30)

    # Total reviews
    total_reviews_q = await db.execute(
        select(func.count(ReviewLog.id)).where(ReviewLog.user_id == user_id)
    )
    total_reviews = total_reviews_q.scalar() or 0

    # Total cards (across user's decks)
    total_cards_q = await db.execute(
        select(func.count(Card.id))
        .join(Deck, Deck.id == Card.deck_id)
        .where(Deck.owner_id == user_id)
    )
    total_cards = total_cards_q.scalar() or 0

    # Due today
    due_q = await db.execute(
        select(func.count(Card.id))
        .join(Deck, Deck.id == Card.deck_id)
        .where(and_(Deck.owner_id == user_id, Card.due <= now, Card.state != "new"))
    )
    cards_due_today = due_q.scalar() or 0

    # New cards
    new_q = await db.execute(
        select(func.count(Card.id))
        .join(Deck, Deck.id == Card.deck_id)
        .where(and_(Deck.owner_id == user_id, Card.state == "new"))
    )
    cards_new = new_q.scalar() or 0

    # Retention rate (% of "good"/"easy" out of all reviews, last 30 days)
    retention_q = await db.execute(
        select(ReviewLog.rating, func.count(ReviewLog.id))
        .where(and_(ReviewLog.user_id == user_id, ReviewLog.reviewed_at >= thirty_days_ago))
        .group_by(ReviewLog.rating)
    )
    rating_counts = dict(retention_q.all())
    total_recent = sum(rating_counts.values()) or 1
    passed = rating_counts.get(ReviewRating.GOOD, 0) + rating_counts.get(ReviewRating.EASY, 0)
    average_retention = round((passed / total_recent) * 100, 1)

    # Daily stats (last 30 days)
    logs_q = await db.execute(
        select(ReviewLog).where(
            and_(ReviewLog.user_id == user_id, ReviewLog.reviewed_at >= thirty_days_ago)
        )
    )
    logs = logs_q.scalars().all()

    daily_map = defaultdict(lambda: {"reviews": 0, "new_cards": 0, "passed": 0, "duration": 0})
    for log in logs:
        day = log.reviewed_at.strftime("%Y-%m-%d")
        daily_map[day]["reviews"] += 1
        if log.state_before == "new":
            daily_map[day]["new_cards"] += 1
        if log.rating in (ReviewRating.GOOD, ReviewRating.EASY):
            daily_map[day]["passed"] += 1
        if log.review_duration_ms:
            daily_map[day]["duration"] += log.review_duration_ms

    daily_stats = []
    for day, data in sorted(daily_map.items()):
        retention = round((data["passed"] / data["reviews"]) * 100, 1) if data["reviews"] else 0
        daily_stats.append({
            "date": day,
            "reviews": data["reviews"],
            "new_cards": data["new_cards"],
            "retention": retention,
            "study_time_minutes": round(data["duration"] / 60000, 1),
        })

    # Heatmap (last 365 days, count per day)
    year_ago = now - timedelta(days=365)
    heatmap_q = await db.execute(
        select(ReviewLog.reviewed_at).where(
            and_(ReviewLog.user_id == user_id, ReviewLog.reviewed_at >= year_ago)
        )
    )
    heatmap_raw = heatmap_q.scalars().all()
    heatmap_data = defaultdict(int)
    for dt in heatmap_raw:
        heatmap_data[dt.strftime("%Y-%m-%d")] += 1

    user_q = await db.execute(select(User).where(User.id == user_id))
    user = user_q.scalar_one()

    return {
        "total_reviews": total_reviews,
        "total_cards": total_cards,
        "cards_due_today": cards_due_today,
        "cards_new": cards_new,
        "average_retention": average_retention,
        "current_streak": user.streak,
        "total_xp": user.total_xp,
        "level": user.level,
        "daily_stats": daily_stats,
        "heatmap_data": dict(heatmap_data),
    }


async def get_deck_performance(db: AsyncSession, user_id: int) -> list:
    decks_q = await db.execute(select(Deck).where(Deck.owner_id == user_id))
    decks = decks_q.scalars().all()
    result = []
    for deck in decks:
        avg_stability_q = await db.execute(
            select(func.avg(Card.stability)).where(Card.deck_id == deck.id)
        )
        avg_diff_q = await db.execute(
            select(func.avg(Card.difficulty)).where(Card.deck_id == deck.id)
        )
        result.append({
            "deck_id": deck.id,
            "deck_name": deck.name,
            "card_count": deck.card_count,
            "avg_stability": round(avg_stability_q.scalar() or 0, 2),
            "avg_difficulty": round(avg_diff_q.scalar() or 0, 2),
        })
    return result
