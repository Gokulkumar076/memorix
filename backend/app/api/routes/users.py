from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.schemas import UserOut, UserUpdate
from app.services import user_service
from app.core.security import get_current_user

router = APIRouter()


@router.get("/me", response_model=UserOut)
async def get_profile(current_user=Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserOut)
async def update_profile(
    data: UserUpdate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await user_service.update_user(db, current_user, data)
