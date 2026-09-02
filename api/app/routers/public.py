"""Unauthenticated marketplace tier.

Anyone can browse open jobs and the worker directory. Worker contact details are never
exposed here — names are masked and email/phone are omitted entirely (see mask_name and
PublicWorkerOut). Acting on a listing (apply, hire, contact) still requires signing in.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.db import get_db
from app.models import (
    CITIES,
    Company,
    Job,
    JobStatus,
    Role,
    Trade,
    User,
    VerificationStatus,
    WorkerProfile,
)
from app.schemas import JobOut, PublicStats, PublicWorkerOut, TradeTile
from app.serializers import applicant_counts, job_out

router = APIRouter(prefix="/api/public", tags=["public"])

JOB_LOADERS = (selectinload(Job.trade), selectinload(Job.company))
PROFILE_LOADERS = (selectinload(WorkerProfile.user), selectinload(WorkerProfile.trade))


def mask_name(full_name: str) -> str:
    """"Ahmed Al-Zahrani" -> "Ahmed A." — enough to feel real, not enough to identify."""
    parts = [p for p in full_name.split() if p]
    if not parts:
        return "Worker"
    if len(parts) == 1:
        return parts[0]
    return f"{parts[0]} {parts[-1][0]}."


def public_worker_out(profile: WorkerProfile) -> PublicWorkerOut:
    return PublicWorkerOut(
        id=profile.id,
        full_name=mask_name(profile.user.full_name),
        city=profile.city,
        years_experience=profile.years_experience,
        expected_salary_sar=profile.expected_salary_sar,
        availability_date=profile.availability_date,
        verification_status=profile.verification_status,
        headline=profile.headline,
        bio=profile.bio,
        trade=profile.trade,
    )


@router.get("/stats", response_model=PublicStats)
def stats(db: Session = Depends(get_db)) -> PublicStats:
    def count(stmt) -> int:
        return db.scalar(stmt) or 0

    return PublicStats(
        workers=count(select(func.count(WorkerProfile.id))),
        verified_workers=count(
            select(func.count(WorkerProfile.id)).where(
                WorkerProfile.verification_status == VerificationStatus.verified
            )
        ),
        open_jobs=count(select(func.count(Job.id)).where(Job.status == JobStatus.open)),
        contractors=count(select(func.count(User.id)).where(User.role == Role.seller)),
        cities=len(CITIES),
        trades=count(select(func.count(Trade.id))),
    )


@router.get("/trades", response_model=list[TradeTile])
def trade_tiles(db: Session = Depends(get_db)) -> list[TradeTile]:
    job_rows = dict(
        db.execute(
            select(Job.trade_id, func.count(Job.id))
            .where(Job.status == JobStatus.open)
            .group_by(Job.trade_id)
        ).all()
    )
    worker_rows = dict(
        db.execute(
            select(WorkerProfile.trade_id, func.count(WorkerProfile.id)).group_by(
                WorkerProfile.trade_id
            )
        ).all()
    )
    trades = db.scalars(select(Trade).order_by(Trade.name_en)).all()
    return [
        TradeTile(
            id=t.id,
            slug=t.slug,
            name_en=t.name_en,
            name_ar=t.name_ar,
            open_jobs=job_rows.get(t.id, 0),
            workers=worker_rows.get(t.id, 0),
        )
        for t in trades
    ]


@router.get("/jobs", response_model=list[JobOut])
def public_jobs(
    db: Session = Depends(get_db),
    trade_id: int | None = None,
    city: str | None = None,
    job_type: str | None = None,
    q: str | None = None,
    limit: int | None = Query(default=None, ge=1, le=60),
) -> list[JobOut]:
    stmt = (
        select(Job)
        .options(*JOB_LOADERS)
        .where(Job.status == JobStatus.open)
        .order_by(Job.created_at.desc(), Job.id.desc())
    )
    if trade_id:
        stmt = stmt.where(Job.trade_id == trade_id)
    if city:
        stmt = stmt.where(Job.city == city)
    if job_type:
        stmt = stmt.where(Job.job_type == job_type)
    if q:
        needle = f"%{q.strip()}%"
        stmt = stmt.where(or_(Job.title.ilike(needle), Job.description.ilike(needle)))
    if limit:
        stmt = stmt.limit(limit)

    jobs = list(db.scalars(stmt).all())
    counts = applicant_counts(db, [j.id for j in jobs])
    return [job_out(j, applicant_count=counts.get(j.id, 0)) for j in jobs]


@router.get("/jobs/{job_id}", response_model=JobOut)
def public_job(job_id: int, db: Session = Depends(get_db)) -> JobOut:
    job = db.scalar(
        select(Job).options(*JOB_LOADERS).where(Job.id == job_id, Job.status == JobStatus.open)
    )
    if job is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Job not found or no longer open")
    return job_out(job, applicant_count=applicant_counts(db, [job.id]).get(job.id, 0))


@router.get("/workers", response_model=list[PublicWorkerOut])
def public_workers(
    db: Session = Depends(get_db),
    trade_id: int | None = None,
    city: str | None = None,
    min_experience: int | None = None,
    limit: int | None = Query(default=None, ge=1, le=60),
) -> list[PublicWorkerOut]:
    stmt = (
        select(WorkerProfile)
        .options(*PROFILE_LOADERS)
        .order_by(
            (WorkerProfile.verification_status == VerificationStatus.verified).desc(),
            WorkerProfile.years_experience.desc(),
            WorkerProfile.id,
        )
    )
    if trade_id:
        stmt = stmt.where(WorkerProfile.trade_id == trade_id)
    if city:
        stmt = stmt.where(WorkerProfile.city == city)
    if min_experience:
        stmt = stmt.where(WorkerProfile.years_experience >= min_experience)
    if limit:
        stmt = stmt.limit(limit)
    return [public_worker_out(p) for p in db.scalars(stmt).all()]


@router.get("/workers/{worker_id}", response_model=PublicWorkerOut)
def public_worker(worker_id: int, db: Session = Depends(get_db)) -> PublicWorkerOut:
    profile = db.scalar(
        select(WorkerProfile).options(*PROFILE_LOADERS).where(WorkerProfile.id == worker_id)
    )
    if profile is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Worker profile not found")
    return public_worker_out(profile)


@router.get("/companies", response_model=list[dict])
def public_companies(db: Session = Depends(get_db)) -> list[dict]:
    rows = db.execute(
        select(Company, func.count(Job.id))
        .join(Job, (Job.company_id == Company.id) & (Job.status == JobStatus.open), isouter=True)
        .group_by(Company.id)
        .order_by(func.count(Job.id).desc())
    ).all()
    return [
        {
            "id": c.id,
            "name_en": c.name_en,
            "name_ar": c.name_ar,
            "city": c.city,
            "description": c.description,
            "open_jobs": n,
        }
        for c, n in rows
    ]
