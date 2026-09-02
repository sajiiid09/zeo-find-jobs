from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import (
    CITIES,
    ApplicationStatus,
    JobStatus,
    JobType,
    Trade,
    VerificationStatus,
)
from app.schemas import MetaOut, TradeOut

router = APIRouter(prefix="/api", tags=["meta"])


@router.get("/trades", response_model=list[TradeOut])
def list_trades(db: Session = Depends(get_db)) -> list[Trade]:
    return list(db.scalars(select(Trade).order_by(Trade.name_en)).all())


@router.get("/meta", response_model=MetaOut)
def get_meta() -> MetaOut:
    return MetaOut(
        cities=CITIES,
        job_types=[t.value for t in JobType],
        job_statuses=[s.value for s in JobStatus],
        application_statuses=[s.value for s in ApplicationStatus],
        verification_statuses=[s.value for s in VerificationStatus],
    )
