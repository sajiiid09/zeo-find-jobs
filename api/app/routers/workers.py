from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db import get_db
from app.deps import require_role
from app.models import Role, User, WorkerProfile
from app.schemas import WorkerOut
from app.serializers import worker_out

router = APIRouter(prefix="/api/workers", tags=["workers"])

LOADERS = (selectinload(WorkerProfile.user), selectinload(WorkerProfile.trade))


@router.get("", response_model=list[WorkerOut])
def list_workers(
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.seller, Role.admin)),
    trade_id: int | None = None,
    city: str | None = None,
    verification: str | None = None,
    min_experience: int | None = None,
    max_salary: int | None = None,
) -> list[WorkerOut]:
    stmt = (
        select(WorkerProfile)
        .options(*LOADERS)
        .order_by(WorkerProfile.years_experience.desc(), WorkerProfile.id)
    )
    if trade_id:
        stmt = stmt.where(WorkerProfile.trade_id == trade_id)
    if city:
        stmt = stmt.where(WorkerProfile.city == city)
    if verification and verification != "all":
        stmt = stmt.where(WorkerProfile.verification_status == verification)
    if min_experience:
        stmt = stmt.where(WorkerProfile.years_experience >= min_experience)
    if max_salary:
        stmt = stmt.where(WorkerProfile.expected_salary_sar <= max_salary)
    return [worker_out(p) for p in db.scalars(stmt).all()]


@router.get("/{worker_id}", response_model=WorkerOut)
def get_worker(
    worker_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.seller, Role.admin)),
) -> WorkerOut:
    profile = db.scalar(select(WorkerProfile).options(*LOADERS).where(WorkerProfile.id == worker_id))
    if profile is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Worker profile not found")
    return worker_out(profile)
