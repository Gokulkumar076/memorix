from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.schemas import AnalyticsSummary
from app.services import analytics_service
from app.core.security import get_current_user

router = APIRouter()


@router.get("/summary", response_model=AnalyticsSummary)
async def get_summary(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = await analytics_service.get_analytics_summary(db, current_user.id)
    return AnalyticsSummary(**data)


@router.get("/deck-performance")
async def get_deck_performance(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await analytics_service.get_deck_performance(db, current_user.id)
