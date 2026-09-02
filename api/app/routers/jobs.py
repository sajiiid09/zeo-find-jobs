from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session, selectinload

from app.db import get_db
from app.deps import get_current_user, require_role
from app.models import Application, Job, JobStatus, Role, User
from app.schemas import ApplicationOut, JobCreate, JobOut, JobUpdate
from app.serializers import applicant_counts, applied_job_ids, job_out, jobs_out, worker_out

router = APIRouter(prefix="/api/jobs", tags=["jobs"])

LOADERS = (
    selectinload(Job.trade),
    selectinload(Job.company),
    selectinload(Job.seller),
)


@router.get("", response_model=list[JobOut])
def list_jobs(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    trade_id: int | None = None,
    city: str | None = None,
    job_type: str | None = None,
    q: str | None = None,
    job_status: str | None = Query(default="open", alias="status"),
) -> list[JobOut]:
    stmt = select(Job).options(*LOADERS).order_by(Job.created_at.desc(), Job.id.desc())
    if trade_id:
        stmt = stmt.where(Job.trade_id == trade_id)
    if city:
        stmt = stmt.where(Job.city == city)
    if job_type:
        stmt = stmt.where(Job.job_type == job_type)
    if job_status and job_status != "all":
        stmt = stmt.where(Job.status == job_status)
    if q:
        needle = f"%{q.strip()}%"
        stmt = stmt.where(or_(Job.title.ilike(needle), Job.description.ilike(needle)))
    return jobs_out(db, list(db.scalars(stmt).all()), user)


@router.post("", response_model=JobOut, status_code=status.HTTP_201_CREATED)
def create_job(
    payload: JobCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.seller)),
) -> JobOut:
    if user.company is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "This account has no company profile")
    if payload.salary_max < payload.salary_min:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Maximum salary is below the minimum")
    job = Job(
        seller_id=user.id,
        company_id=user.company.id,
        status=JobStatus.open,
        **payload.model_dump(),
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job_out(job)


@router.get("/{job_id}", response_model=JobOut)
def get_job(
    job_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> JobOut:
    job = db.scalar(select(Job).options(*LOADERS).where(Job.id == job_id))
    if job is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Job not found")
    applied = applied_job_ids(db, user.id) if user.role == Role.buyer else set()
    return job_out(
        job,
        applicant_count=applicant_counts(db, [job.id]).get(job.id, 0),
        has_applied=job.id in applied,
    )


@router.patch("/{job_id}", response_model=JobOut)
def update_job(
    job_id: int,
    payload: JobUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> JobOut:
    job = db.scalar(select(Job).options(*LOADERS).where(Job.id == job_id))
    if job is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Job not found")
    if user.role == Role.seller and job.seller_id != user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "This job belongs to another contractor")
    if user.role == Role.buyer:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Workers cannot modify jobs")
    if payload.status is not None:
        job.status = payload.status
    if payload.is_flagged is not None:
        if user.role != Role.admin:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Only admins can flag jobs")
        job.is_flagged = payload.is_flagged
    db.commit()
    db.refresh(job)
    return job_out(job, applicant_count=applicant_counts(db, [job.id]).get(job.id, 0))


@router.get("/{job_id}/applications", response_model=list[ApplicationOut])
def job_applications(
    job_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.seller, Role.admin)),
) -> list[ApplicationOut]:
    job = db.get(Job, job_id)
    if job is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Job not found")
    if user.role == Role.seller and job.seller_id != user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "This job belongs to another contractor")
    applications = list(
        db.scalars(
            select(Application)
            .options(
                selectinload(Application.buyer).selectinload(User.profile),
            )
            .where(Application.job_id == job_id)
            .order_by(Application.created_at.desc())
        ).all()
    )
    out: list[ApplicationOut] = []
    for app in applications:
        out.append(
            ApplicationOut(
                id=app.id,
                status=app.status,
                note=app.note,
                created_at=app.created_at,
                updated_at=app.updated_at,
                job=None,
                worker=worker_out(app.buyer.profile) if app.buyer.profile else None,
            )
        )
    return out
