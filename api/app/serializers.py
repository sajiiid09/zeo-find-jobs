"""Shared row -> schema helpers so every router returns the same job/worker shape."""

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Application, Job, User, WorkerProfile
from app.schemas import JobOut, WorkerOut


def applicant_counts(db: Session, job_ids: list[int]) -> dict[int, int]:
    if not job_ids:
        return {}
    rows = db.execute(
        select(Application.job_id, func.count(Application.id))
        .where(Application.job_id.in_(job_ids))
        .group_by(Application.job_id)
    ).all()
    return {job_id: count for job_id, count in rows}


def applied_job_ids(db: Session, buyer_id: int) -> set[int]:
    return set(
        db.scalars(select(Application.job_id).where(Application.buyer_id == buyer_id)).all()
    )


def job_out(job: Job, *, applicant_count: int = 0, has_applied: bool = False) -> JobOut:
    data = JobOut.model_validate(job)
    data.applicant_count = applicant_count
    data.has_applied = has_applied
    return data


def jobs_out(db: Session, jobs: list[Job], viewer: User | None = None) -> list[JobOut]:
    counts = applicant_counts(db, [j.id for j in jobs])
    applied: set[int] = set()
    if viewer is not None and viewer.role.value == "buyer":
        applied = applied_job_ids(db, viewer.id)
    return [
        job_out(j, applicant_count=counts.get(j.id, 0), has_applied=j.id in applied) for j in jobs
    ]


def worker_out(profile: WorkerProfile) -> WorkerOut:
    return WorkerOut(
        id=profile.id,
        user_id=profile.user_id,
        full_name=profile.user.full_name,
        email=profile.user.email,
        phone=profile.user.phone,
        city=profile.city,
        years_experience=profile.years_experience,
        expected_salary_sar=profile.expected_salary_sar,
        availability_date=profile.availability_date,
        verification_status=profile.verification_status,
        headline=profile.headline,
        bio=profile.bio,
        trade=profile.trade,
    )
