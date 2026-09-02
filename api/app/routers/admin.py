from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db import get_db
from app.deps import require_role
from app.models import Job, Role, User, VerificationStatus, WorkerProfile
from app.schemas import JobOut, VerificationAction, WorkerOut
from app.serializers import jobs_out, worker_out

router = APIRouter(prefix="/api/admin", tags=["admin"])

PROFILE_LOADERS = (selectinload(WorkerProfile.user), selectinload(WorkerProfile.trade))


@router.get("/verifications", response_model=list[WorkerOut])
def verification_queue(
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.admin)),
    verification_status: str = Query(default="pending", alias="status"),
) -> list[WorkerOut]:
    stmt = select(WorkerProfile).options(*PROFILE_LOADERS).order_by(WorkerProfile.created_at)
    if verification_status != "all":
        stmt = stmt.where(WorkerProfile.verification_status == verification_status)
    return [worker_out(p) for p in db.scalars(stmt).all()]


@router.patch("/workers/{worker_id}/verification", response_model=WorkerOut)
def set_verification(
    worker_id: int,
    payload: VerificationAction,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.admin)),
) -> WorkerOut:
    profile = db.scalar(
        select(WorkerProfile).options(*PROFILE_LOADERS).where(WorkerProfile.id == worker_id)
    )
    if profile is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Worker profile not found")
    if payload.action == "approve":
        profile.verification_status = VerificationStatus.verified
    elif payload.action == "reject":
        profile.verification_status = VerificationStatus.rejected
    elif payload.action == "reset":
        profile.verification_status = VerificationStatus.pending
    else:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Action must be approve, reject or reset")
    db.commit()
    db.refresh(profile)
    return worker_out(profile)


@router.get("/jobs", response_model=list[JobOut])
def moderation_jobs(
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.admin)),
) -> list[JobOut]:
    jobs = list(
        db.scalars(
            select(Job)
            .options(selectinload(Job.trade), selectinload(Job.company))
            .order_by(Job.is_flagged.desc(), Job.created_at.desc())
        ).all()
    )
    return jobs_out(db, jobs)
