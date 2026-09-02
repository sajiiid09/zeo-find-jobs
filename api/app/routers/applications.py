from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db import get_db
from app.deps import get_current_user, require_role
from app.models import Application, Job, JobStatus, Role, User
from app.schemas import ApplicationCreate, ApplicationOut, ApplicationUpdate
from app.serializers import job_out, worker_out

router = APIRouter(prefix="/api/applications", tags=["applications"])

JOB_LOADERS = selectinload(Application.job).options(
    selectinload(Job.trade), selectinload(Job.company)
)


@router.post("", response_model=ApplicationOut, status_code=status.HTTP_201_CREATED)
def apply(
    payload: ApplicationCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.buyer)),
) -> ApplicationOut:
    job = db.get(Job, payload.job_id)
    if job is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Job not found")
    if job.status != JobStatus.open:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "This job is closed for applications")
    existing = db.scalar(
        select(Application).where(
            Application.job_id == job.id, Application.buyer_id == user.id
        )
    )
    if existing:
        raise HTTPException(status.HTTP_409_CONFLICT, "You have already applied to this job")
    application = Application(job_id=job.id, buyer_id=user.id, note=payload.note)
    db.add(application)
    db.commit()
    db.refresh(application)
    return ApplicationOut(
        id=application.id,
        status=application.status,
        note=application.note,
        created_at=application.created_at,
        updated_at=application.updated_at,
        job=job_out(job),
        worker=worker_out(user.profile) if user.profile else None,
    )


@router.get("/me", response_model=list[ApplicationOut])
def my_applications(
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.buyer)),
) -> list[ApplicationOut]:
    applications = list(
        db.scalars(
            select(Application)
            .options(JOB_LOADERS)
            .where(Application.buyer_id == user.id)
            .order_by(Application.created_at.desc())
        ).all()
    )
    return [
        ApplicationOut(
            id=a.id,
            status=a.status,
            note=a.note,
            created_at=a.created_at,
            updated_at=a.updated_at,
            job=job_out(a.job),
            worker=None,
        )
        for a in applications
    ]


@router.patch("/{application_id}", response_model=ApplicationOut)
def update_application(
    application_id: int,
    payload: ApplicationUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.seller, Role.admin)),
) -> ApplicationOut:
    application = db.scalar(
        select(Application)
        .options(JOB_LOADERS, selectinload(Application.buyer).selectinload(User.profile))
        .where(Application.id == application_id)
    )
    if application is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Application not found")
    if user.role == Role.seller and application.job.seller_id != user.id:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN, "This application belongs to another contractor's job"
        )
    application.status = payload.status
    db.commit()
    db.refresh(application)
    return ApplicationOut(
        id=application.id,
        status=application.status,
        note=application.note,
        created_at=application.created_at,
        updated_at=application.updated_at,
        job=job_out(application.job),
        worker=worker_out(application.buyer.profile) if application.buyer.profile else None,
    )
